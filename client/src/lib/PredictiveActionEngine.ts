/**
 * PredictiveActionEngine.ts
 * LazyFlow Component: Suggests the 2-3 most valuable next actions for users
 * 
 * Philosophy: Don't make users think - show them exactly what to do next
 */

import { HeatData } from './HeroInsightCalculator';

export interface PredictiveAction {
  id: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  icon: string;
  estimatedTime: string;
  expectedBenefit: string;
  confidence: number;
  actionType: 'immediate' | 'planned' | 'monitoring';
  category: 'safety' | 'quality' | 'efficiency' | 'maintenance';
  oneClickAvailable: boolean;
  apiEndpoint?: string;
  parameters?: any;
}

export class PredictiveActionEngine {
  
  /**
   * Core LazyFlow Method: Generate 2-3 smart next actions
   */
  static generateNextActions(heatData: HeatData): PredictiveAction[] {
    if (!heatData) {
      return this.getDefaultActions();
    }

    const actions: PredictiveAction[] = [];
    
    // Priority 1: Safety/Critical actions
    const safetyActions = this.getSafetyActions(heatData);
    actions.push(...safetyActions);

    // Priority 2: Quality optimization  
    if (actions.length < 3) {
      const qualityActions = this.getQualityActions(heatData);
      actions.push(...qualityActions);
    }

    // Priority 3: Efficiency improvements
    if (actions.length < 3) {
      const efficiencyActions = this.getEfficiencyActions(heatData);
      actions.push(...efficiencyActions);
    }

    // Priority 4: Monitoring/maintenance
    if (actions.length < 3) {
      const monitoringActions = this.getMonitoringActions(heatData);
      actions.push(...monitoringActions);
    }

    // LazyFlow: Always return exactly 2-3 actions (never overwhelm users)
    return actions.slice(0, 3);
  }

  /**
   * Safety Actions: Immediate safety/process integrity actions
   */
  private static getSafetyActions(heatData: HeatData): PredictiveAction[] {
    const actions: PredictiveAction[] = [];

    // Check for critical insights
    const criticalInsights = heatData.insights?.filter(i => 
      i.type === 'critical' && !i.acknowledged
    ) || [];

    if (criticalInsights.length > 0) {
      const insight = criticalInsights[0];
      
      if (insight.title?.includes('Foam') || insight.title?.includes('foam')) {
        actions.push({
          id: 'prevent-foam-collapse',
          priority: 'high',
          title: 'Prevent Foam Collapse',
          description: 'Apply anti-foaming agents and adjust gas flow rates',
          icon: '🛡️',
          estimatedTime: '2-3 minutes',
          expectedBenefit: 'Prevents process disruption',
          confidence: 94,
          actionType: 'immediate',
          category: 'safety',
          oneClickAvailable: true,
          apiEndpoint: '/api/actions/prevent-foam-collapse',
          parameters: { heatId: heatData.heat, urgency: 'high' }
        });
      }

      if (insight.title?.includes('Temperature')) {
        actions.push({
          id: 'stabilize-temperature',
          priority: 'high',
          title: 'Stabilize Temperature',
          description: 'Adjust arc power and cooling to bring temperature to safe range',
          icon: '🌡️',
          estimatedTime: '4-5 minutes',
          expectedBenefit: 'Prevents overheating damage',
          confidence: 91,
          actionType: 'immediate',
          category: 'safety',
          oneClickAvailable: true,
          apiEndpoint: '/api/actions/stabilize-temperature',
          parameters: { heatId: heatData.heat, targetTemp: 1580 }
        });
      }

      if (insight.title?.includes('Energy') || insight.title?.includes('Power')) {
        actions.push({
          id: 'manage-energy-spike',
          priority: 'high',
          title: 'Manage Energy Spike',
          description: 'Reduce arc power and optimize electrode positioning',
          icon: '⚡',
          estimatedTime: '3-4 minutes',
          expectedBenefit: 'Prevents equipment damage',
          confidence: 88,
          actionType: 'immediate',
          category: 'safety',
          oneClickAvailable: true,
          apiEndpoint: '/api/actions/manage-energy-spike'
        });
      }
    }

    return actions;
  }

  /**
   * Quality Actions: Chemistry and grade optimization
   */
  private static getQualityActions(heatData: HeatData): PredictiveAction[] {
    const actions: PredictiveAction[] = [];

    if (heatData.chemSteel) {
      const { C, S, Si, Mn, P } = heatData.chemSteel;

      // Carbon adjustment
      if (C && C < 0.10) {
        actions.push({
          id: 'adjust-carbon-content',
          priority: 'high',
          title: 'Increase Carbon Content',
          description: `Add 0.42t carbon to reach target specification`,
          icon: '⚫',
          estimatedTime: '8-12 minutes',
          expectedBenefit: 'Achieves target grade quality',
          confidence: 89,
          actionType: 'planned',
          category: 'quality',
          oneClickAvailable: true,
          apiEndpoint: '/api/actions/adjust-carbon',
          parameters: { heatId: heatData.heat, targetC: 0.13, addAmount: 0.42 }
        });
      }

      // Sulfur reduction
      if (S && S > 0.025) {
        actions.push({
          id: 'reduce-sulfur-content',
          priority: 'medium',
          title: 'Reduce Sulfur Content',
          description: 'Add desulfurizing agents to improve steel ductility',
          icon: '🧪',
          estimatedTime: '10-15 minutes',
          expectedBenefit: 'Improves final product quality',
          confidence: 87,
          actionType: 'planned',
          category: 'quality',
          oneClickAvailable: true,
          apiEndpoint: '/api/actions/desulfurize',
          parameters: { heatId: heatData.heat, targetS: 0.020 }
        });
      }

      // Silicon adjustment
      if (Si && Si < 0.15) {
        actions.push({
          id: 'adjust-silicon-content',
          priority: 'medium',
          title: 'Optimize Silicon Level',
          description: 'Add ferrosilicon to improve deoxidation',
          icon: '🔬',
          estimatedTime: '6-8 minutes',
          expectedBenefit: 'Better steel cleanliness',
          confidence: 82,
          actionType: 'planned',
          category: 'quality',
          oneClickAvailable: true,
          apiEndpoint: '/api/actions/adjust-silicon'
        });
      }
    }

    return actions;
  }

  /**
   * Efficiency Actions: Energy and process optimization
   */
  private static getEfficiencyActions(heatData: HeatData): PredictiveAction[] {
    const actions: PredictiveAction[] = [];

    // Energy optimization (when process is stable)
    if (heatData.confidence && heatData.confidence > 85) {
      actions.push({
        id: 'optimize-energy-consumption',
        priority: 'medium',
        title: 'Optimize Energy Usage',
        description: 'Reduce power consumption by 8% while maintaining quality',
        icon: '💡',
        estimatedTime: '5-7 minutes',
        expectedBenefit: 'Save €847 this heat',
        confidence: 84,
        actionType: 'planned',
        category: 'efficiency',
        oneClickAvailable: true,
        apiEndpoint: '/api/actions/optimize-energy',
        parameters: { heatId: heatData.heat, powerReduction: 0.08 }
      });
    }

    // Timing optimization
    actions.push({
      id: 'optimize-timing',
      priority: 'low',
      title: 'Optimize Process Timing',
      description: 'Adjust sequence timing to reduce total heat time',
      icon: '⏱️',
      estimatedTime: '3-5 minutes',
      expectedBenefit: 'Save 12 minutes per heat',
      confidence: 76,
      actionType: 'planned',
      category: 'efficiency',
      oneClickAvailable: false
    });

    // Material utilization
    if (heatData.buckets && heatData.buckets.length > 0) {
      actions.push({
        id: 'optimize-material-usage',
        priority: 'low',
        title: 'Optimize Material Mix',
        description: 'Adjust scrap ratios for better cost efficiency',
        icon: '📦',
        estimatedTime: 'Next heat',
        expectedBenefit: 'Save €234 on materials',
        confidence: 72,
        actionType: 'monitoring',
        category: 'efficiency',
        oneClickAvailable: false
      });
    }

    return actions;
  }

  /**
   * Monitoring Actions: Preventive and maintenance actions
   */
  private static getMonitoringActions(heatData: HeatData): PredictiveAction[] {
    const actions: PredictiveAction[] = [];

    // Electrode monitoring
    actions.push({
      id: 'monitor-electrode-consumption',
      priority: 'low',
      title: 'Monitor Electrode Wear',
      description: 'Track electrode consumption patterns for predictive maintenance',
      icon: '📊',
      estimatedTime: 'Ongoing',
      expectedBenefit: 'Prevent unplanned downtime',
      confidence: 78,
      actionType: 'monitoring',
      category: 'maintenance',
      oneClickAvailable: false
    });

    // Chemistry tracking
    actions.push({
      id: 'schedule-chemistry-analysis',
      priority: 'low',
      title: 'Schedule Chemistry Check',
      description: 'Plan next chemistry sampling for quality verification',
      icon: '🔬',
      estimatedTime: '15-20 minutes',
      expectedBenefit: 'Ensures grade compliance',
      confidence: 85,
      actionType: 'monitoring',
      category: 'quality',
      oneClickAvailable: true,
      apiEndpoint: '/api/actions/schedule-chemistry-check'
    });

    return actions;
  }

  /**
   * Default Actions: When no heat data is available
   */
  private static getDefaultActions(): PredictiveAction[] {
    return [
      {
        id: 'load-heat-data',
        priority: 'high',
        title: 'Load Heat Data',
        description: 'Select an active heat to begin monitoring and optimization',
        icon: '📂',
        estimatedTime: '1 minute',
        expectedBenefit: 'Enable AI optimization',
        confidence: 100,
        actionType: 'immediate',
        category: 'maintenance',
        oneClickAvailable: false
      },
      {
        id: 'review-production-schedule',
        priority: 'medium',
        title: 'Review Schedule',
        description: 'Check upcoming heats and plan optimization strategies',
        icon: '📅',
        estimatedTime: '5 minutes',
        expectedBenefit: 'Better planning efficiency',
        confidence: 90,
        actionType: 'monitoring',
        category: 'efficiency',
        oneClickAvailable: false
      },
      {
        id: 'system-health-check',
        priority: 'low',
        title: 'System Health Check',
        description: 'Verify all monitoring systems are operational',
        icon: '🔧',
        estimatedTime: '3 minutes',
        expectedBenefit: 'Ensure reliable monitoring',
        confidence: 95,
        actionType: 'monitoring',
        category: 'maintenance',
        oneClickAvailable: true,
        apiEndpoint: '/api/system/health-check'
      }
    ];
  }

  /**
   * LazyFlow Helper: Get action button styling based on priority
   */
  static getActionButtonVariant(action: PredictiveAction): 'default' | 'secondary' | 'outline' {
    switch (action.priority) {
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  }

  /**
   * LazyFlow Helper: Get priority badge color
   */
  static getPriorityBadgeColor(priority: string): string {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * LazyFlow Helper: Execute one-click action
   */
  static async executeAction(action: PredictiveAction): Promise<{ success: boolean; message: string }> {
    if (!action.oneClickAvailable || !action.apiEndpoint) {
      return { success: false, message: 'Manual action required' };
    }

    try {
      const response = await fetch(action.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.parameters || {})
      });

      const result = await response.json();
      
      if (response.ok) {
        return { success: true, message: `${action.title} executed successfully` };
      } else {
        return { success: false, message: result.error || 'Action failed' };
      }
    } catch (error) {
      console.error(`Failed to execute action ${action.id}:`, error);
      return { success: false, message: 'Network error - please try again' };
    }
  }
}