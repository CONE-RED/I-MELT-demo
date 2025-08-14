/**
 * LF→CC Sync Guard Model
 * 
 * Computes ΔT decay during ladle/caster transfer delays and maps to financial impact
 * Core formula: deltaT = (ETA_to_CC - ETA_target) * dT_per_min per route
 * Financial mapping: 10°C ≈ €150/heat (configurable)
 */

export interface SyncGuardConfig {
  dT_per_min: number;        // Temperature loss per minute delay (°C/min)
  cost_per_10C: number;      // Cost per 10°C temperature loss (€/heat)
  shop_cadence_per_day: number;  // Heats per day for annual calculations
  shop_working_days: number;     // Working days per year
}

export interface RouteETA {
  eta_LF: number;           // ETA from ladle furnace (minutes from now)
  eta_CC: number;           // ETA to continuous caster (minutes from now)  
  eta_target: number;       // Target transfer time (minutes from now)
  route_id: string;         // Route identifier (e.g., "LF1→CC2")
}

export interface TemperatureImpact {
  predicted_deltaT: number; // Predicted temperature loss (°C)
  cost_per_heat: number;    // Cost impact per heat (€)
  cost_per_day: number;     // Cost impact per day (€)
  cost_per_year: number;    // Cost impact per year (€)
}

export interface MitigationOption {
  id: 'boost' | 'coordinate';
  name: string;
  description: string;
  energy_cost: number;      // Additional energy cost (€/heat)
  deltaT_reduction: number; // Temperature loss reduction (°C)
  time_impact: number;      // Time impact (minutes)
  net_cost: number;         // Net cost after mitigation (€/heat)
}

export interface SyncDecision {
  timestamp: number;
  route_id: string;
  original_impact: TemperatureImpact;
  chosen_mitigation: MitigationOption | null;
  final_impact: TemperatureImpact;
  operator: string;
}

// Default configuration based on steel industry standards
export const DEFAULT_SYNC_CONFIG: SyncGuardConfig = {
  dT_per_min: 1.8,          // ~2°C per minute is typical for EAF steel
  cost_per_10C: 150,        // €150 per 10°C loss based on reheating costs
  shop_cadence_per_day: 24, // 24 heats per day (one per hour)
  shop_working_days: 350    // Working days per year
};

export class SyncGuard {
  private config: SyncGuardConfig;

  constructor(config: SyncGuardConfig = DEFAULT_SYNC_CONFIG) {
    this.config = config;
  }

  /**
   * Calculate temperature loss and financial impact for a given route
   */
  calculateTemperatureImpact(route: RouteETA): TemperatureImpact {
    // Calculate delay beyond target
    const delay_minutes = Math.max(0, route.eta_CC - route.eta_target);
    
    // Calculate temperature loss: deltaT = delay * dT_per_min
    const predicted_deltaT = delay_minutes * this.config.dT_per_min;
    
    // Map temperature loss to cost: cost = (deltaT / 10) * cost_per_10C
    const cost_per_heat = (predicted_deltaT / 10) * this.config.cost_per_10C;
    
    // Scale to daily and annual costs
    const cost_per_day = cost_per_heat * this.config.shop_cadence_per_day;
    const cost_per_year = cost_per_day * this.config.shop_working_days;

    return {
      predicted_deltaT,
      cost_per_heat,
      cost_per_day,
      cost_per_year
    };
  }

  /**
   * Generate mitigation options with financial analysis
   */
  getMitigationOptions(route: RouteETA, baseline_impact: TemperatureImpact): MitigationOption[] {
    const delay_minutes = Math.max(0, route.eta_CC - route.eta_target);
    
    // Option 1: Boost superheat now
    const boost_energy_cost = 25; // €25 for additional reheating
    const boost_deltaT_reduction = Math.min(baseline_impact.predicted_deltaT, delay_minutes * 1.2); // Can reduce most of the loss
    const boost_net_cost = boost_energy_cost - (boost_deltaT_reduction / 10) * this.config.cost_per_10C;

    const boost_option: MitigationOption = {
      id: 'boost',
      name: 'Boost superheat now',
      description: 'Add energy to maintain temperature during delay',
      energy_cost: boost_energy_cost,
      deltaT_reduction: boost_deltaT_reduction,
      time_impact: 2, // 2 minutes additional heating time
      net_cost: Math.max(0, boost_net_cost)
    };

    // Option 2: Coordinate LF/CC timing
    const coordinate_deltaT_reduction = delay_minutes * 0.8 * this.config.dT_per_min; // Reduces 80% of delay impact
    const coordinate_net_cost = baseline_impact.cost_per_heat - (coordinate_deltaT_reduction / 10) * this.config.cost_per_10C;

    const coordinate_option: MitigationOption = {
      id: 'coordinate',
      name: 'Coordinate LF/CC',
      description: 'Reschedule caster to minimize delay',
      energy_cost: 0, // No additional energy cost
      deltaT_reduction: coordinate_deltaT_reduction,
      time_impact: -delay_minutes * 0.6, // Reduces delay by 60%
      net_cost: Math.max(0, coordinate_net_cost)
    };

    return [boost_option, coordinate_option];
  }

  /**
   * Apply chosen mitigation and calculate final impact
   */
  applyMitigation(
    route: RouteETA, 
    baseline_impact: TemperatureImpact, 
    mitigation: MitigationOption
  ): TemperatureImpact {
    // Calculate new temperature loss after mitigation
    const new_deltaT = Math.max(0, baseline_impact.predicted_deltaT - mitigation.deltaT_reduction);
    
    // Calculate new cost including mitigation energy cost
    const temperature_cost = (new_deltaT / 10) * this.config.cost_per_10C;
    const total_cost_per_heat = temperature_cost + mitigation.energy_cost;
    
    const cost_per_day = total_cost_per_heat * this.config.shop_cadence_per_day;
    const cost_per_year = cost_per_day * this.config.shop_working_days;

    return {
      predicted_deltaT: new_deltaT,
      cost_per_heat: total_cost_per_heat,
      cost_per_day,
      cost_per_year
    };
  }

  /**
   * Create a complete sync analysis for a route
   */
  analyzeRoute(route: RouteETA): {
    route: RouteETA;
    baseline_impact: TemperatureImpact;
    mitigation_options: MitigationOption[];
    delay_minutes: number;
    requires_action: boolean;
  } {
    const baseline_impact = this.calculateTemperatureImpact(route);
    const mitigation_options = this.getMitigationOptions(route, baseline_impact);
    const delay_minutes = Math.max(0, route.eta_CC - route.eta_target);
    const requires_action = delay_minutes > 3; // Alert if delay > 3 minutes

    return {
      route,
      baseline_impact,
      mitigation_options,
      delay_minutes,
      requires_action
    };
  }

  /**
   * Update configuration parameters
   */
  updateConfig(newConfig: Partial<SyncGuardConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): SyncGuardConfig {
    return { ...this.config };
  }
}

/**
 * Decision log storage (in-memory for demo)
 */
export class SyncDecisionLog {
  private decisions: SyncDecision[] = [];

  logDecision(decision: SyncDecision) {
    this.decisions.push(decision);
    console.log(`🎯 Sync Decision Logged: ${decision.route_id} - ${decision.chosen_mitigation?.name || 'No action'}`);
  }

  getDecisions(route_id?: string): SyncDecision[] {
    if (route_id) {
      return this.decisions.filter(d => d.route_id === route_id);
    }
    return [...this.decisions];
  }

  getRecentDecisions(count: number = 10): SyncDecision[] {
    return this.decisions.slice(-count);
  }

  getTotalSavings(): { daily: number; annual: number } {
    const total_daily_savings = this.decisions.reduce((sum, decision) => {
      const savings_per_heat = decision.original_impact.cost_per_heat - decision.final_impact.cost_per_heat;
      return sum + savings_per_heat;
    }, 0);

    return {
      daily: total_daily_savings,
      annual: total_daily_savings * DEFAULT_SYNC_CONFIG.shop_working_days
    };
  }
}

// Global instances for demo
export const syncGuard = new SyncGuard();
export const syncDecisionLog = new SyncDecisionLog();