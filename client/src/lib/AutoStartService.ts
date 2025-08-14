/**
 * AutoStartService.ts
 * Factory-Ready Component: Eliminates empty cards by auto-starting simulation
 * 
 * Addresses Conny 4.0's Go/No-Go Gate G1: Deterministic Start (No Clicks)
 */

export interface AutoStartConfig {
  seed?: number;
  heatId?: number;
  scenario?: string;
  autoStart?: boolean;
}

export interface SimulationStatus {
  running: boolean;
  heatId: number | null;
  scenario: string | null;
  seed: number | null;
  confidence: number;
  stage: string;
}

export class AutoStartService {
  private static instance: AutoStartService;
  private isStarting = false;
  private currentStatus: SimulationStatus = {
    running: false,
    heatId: null,
    scenario: null,
    seed: null,
    confidence: 0,
    stage: 'idle'
  };

  private constructor() {}

  static getInstance(): AutoStartService {
    if (!AutoStartService.instance) {
      AutoStartService.instance = new AutoStartService();
    }
    return AutoStartService.instance;
  }

  /**
   * Auto-start simulation based on URL parameters or defaults
   * Core requirement: No empty cards, deterministic seed=42
   */
  async autoStart(config: AutoStartConfig = {}): Promise<SimulationStatus> {
    if (this.isStarting) {
      console.log('🔄 AutoStart already in progress, skipping...');
      return this.currentStatus;
    }

    const defaultConfig: Required<AutoStartConfig> = {
      seed: 42,
      heatId: 93378,
      scenario: '',
      autoStart: true,
      ...config
    };

    console.log('🚀 AutoStart initiating:', defaultConfig);
    this.isStarting = true;

    try {
      // Step 1: Start base simulation with deterministic seed (using GET with query params)
      const startUrl = `/api/demo/start?seed=${defaultConfig.seed}&heatId=${defaultConfig.heatId}`;
      const startResponse = await fetch(startUrl, {
        method: 'GET'
      });

      if (!startResponse.ok) {
        throw new Error(`Failed to start simulation: ${startResponse.statusText}`);
      }

      const startResult = await startResponse.json();
      console.log('✅ Base simulation started:', startResult);

      // Step 2: Apply scenario if specified
      if (defaultConfig.scenario) {
        await this.applyScenario(defaultConfig.scenario);
      }

      // Step 3: Update current status
      this.currentStatus = {
        running: true,
        heatId: defaultConfig.heatId,
        scenario: defaultConfig.scenario || null,
        seed: defaultConfig.seed,
        confidence: startResult.confidence || 85,
        stage: startResult.stage || 'MELT'
      };

      console.log('🎯 AutoStart completed successfully:', this.currentStatus);
      return this.currentStatus;

    } catch (error) {
      console.error('❌ AutoStart failed:', error);
      this.currentStatus.running = false;
      throw error;
    } finally {
      this.isStarting = false;
    }
  }

  /**
   * Apply specific scenario for demo purposes
   */
  private async applyScenario(scenarioId: string): Promise<void> {
    try {
      console.log(`🎬 Applying scenario: ${scenarioId}`);
      
      const scenarioResponse = await fetch(`/api/demo/scenario/${scenarioId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!scenarioResponse.ok) {
        console.warn(`⚠️ Scenario ${scenarioId} failed, continuing without it`);
        return;
      }

      const scenarioResult = await scenarioResponse.json();
      console.log(`✅ Scenario ${scenarioId} applied:`, scenarioResult.scenario?.name);
      
    } catch (error) {
      console.warn(`⚠️ Scenario ${scenarioId} error:`, error);
      // Continue without scenario - don't fail the auto-start
    }
  }

  /**
   * Manual start simulation (for UI button)
   */
  async manualStart(config: Partial<AutoStartConfig> = {}): Promise<SimulationStatus> {
    console.log('🖱️ Manual start triggered');
    return this.autoStart({ ...config, autoStart: false });
  }

  /**
   * Reset to baseline with deterministic seed
   */
  async reset(seed: number = 42): Promise<SimulationStatus> {
    console.log(`🔄 Resetting simulation with seed=${seed}`);
    
    try {
      // Use GET with query parameters like the ResetControls component
      const resetResponse = await fetch(`/api/demo/reset?seed=${seed}&heatId=93378`, {
        method: 'GET'
      });

      if (!resetResponse.ok) {
        throw new Error(`Reset failed: ${resetResponse.statusText}`);
      }

      const resetResult = await resetResponse.json();
      
      // Update status to baseline
      this.currentStatus = {
        running: true,
        heatId: resetResult.heatId || 93378,
        scenario: null,
        seed: seed,
        confidence: resetResult.confidence || 85,
        stage: resetResult.stage || 'MELT'
      };

      console.log('✅ Reset completed:', this.currentStatus);
      return this.currentStatus;

    } catch (error) {
      console.error('❌ Reset failed:', error);
      throw error;
    }
  }

  /**
   * Get current simulation status
   */
  getStatus(): SimulationStatus {
    return { ...this.currentStatus };
  }

  /**
   * Check if simulation is running
   */
  isRunning(): boolean {
    return this.currentStatus.running;
  }

  /**
   * Parse URL parameters for auto-start configuration
   */
  static parseURLParameters(): AutoStartConfig {
    if (typeof window === 'undefined') return {};

    const params = new URLSearchParams(window.location.search);
    const config: AutoStartConfig = {};

    // Parse seed parameter
    const seedParam = params.get('seed');
    if (seedParam) {
      const seed = parseInt(seedParam, 10);
      if (!isNaN(seed)) {
        config.seed = seed;
      }
    }

    // Parse heatId parameter
    const heatIdParam = params.get('heatId');
    if (heatIdParam) {
      const heatId = parseInt(heatIdParam, 10);
      if (!isNaN(heatId)) {
        config.heatId = heatId;
      }
    }

    // Parse scenario parameter
    const scenario = params.get('scenario');
    if (scenario) {
      config.scenario = scenario;
    }

    // Auto-start is enabled by default unless explicitly disabled
    const autoStartParam = params.get('autoStart');
    config.autoStart = autoStartParam !== 'false';

    return config;
  }

  /**
   * Update URL parameters without page reload
   */
  static updateURLParameters(config: Partial<AutoStartConfig>): void {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);

    // Update parameters
    if (config.seed !== undefined) {
      params.set('seed', config.seed.toString());
    }
    if (config.heatId !== undefined) {
      params.set('heatId', config.heatId.toString());
    }
    if (config.scenario !== undefined) {
      if (config.scenario) {
        params.set('scenario', config.scenario);
      } else {
        params.delete('scenario');
      }
    }

    // Update URL without reload
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }
}

// Export singleton instance for convenient usage
export const autoStartService = AutoStartService.getInstance();