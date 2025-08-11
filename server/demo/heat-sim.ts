import { EventEmitter } from "events";

function mulberry32(a: number) {
  return function() {
    a |= 0;
    a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export type HeatTick = {
  ts: number;
  stage: "BOR" | "MELT" | "REFINE" | "TAP";
  tempC: number;
  kwhTotal: number;
  kwhPerT: number;
  pf: number;
  tap: number;
  thd: number;
  foamIdx: number;
  cPct?: number;
  oPct?: number;
  note?: string;
};

export interface ScenarioInjection {
  id: string;
  injectAtSec?: number;
  delta: Partial<HeatTick>;
  recommendation?: {
    text: string;
    expectedImpact: Record<string, any>;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    timeToApply: string;
  };
}

export class HeatSim extends EventEmitter {
  private rnd: () => number;
  private t = 0;
  private massT = 85;
  private kwh = 0;
  private stage: "BOR" | "MELT" | "REFINE" | "TAP" = "BOR";
  private activeScenario: ScenarioInjection | null = null;
  private scenarioApplied = false;
  
  constructor(seed = 42) {
    super();
    this.rnd = mulberry32(seed);
  }
  
  private nextStage() {
    this.stage = this.stage === "BOR" ? "MELT" : 
                 this.stage === "MELT" ? "REFINE" : "TAP";
  }
  
  tick(): HeatTick {
    this.t++;
    
    // Crude physics-ish increments
    let pf = 0.82 + this.rnd() * 0.06;
    let tap = this.stage === "MELT" ? 9 : this.stage === "REFINE" ? 7 : 6;
    const powerMW = (this.stage === "MELT" ? 65 : 45) * pf;
    this.kwh += powerMW / 3600;
    let thd = 2 + (this.stage === "MELT" ? 4 : 2) + this.rnd() * 0.5;
    let foamIdx = Math.max(0, Math.min(1, 
      0.5 + (this.stage === "MELT" ? 0.3 : 0.1) + 
      (thd - 4) / 10 + (this.rnd() - 0.5) * 0.1
    ));
    let tempC = 20 + Math.min(1650, 
      3 * this.t + (this.stage === "REFINE" ? 150 : 0) + (foamIdx * 40)
    );
    const kwhPerT = this.kwh / this.massT;
    
    // Apply scenario injection if conditions are met
    if (this.activeScenario && !this.scenarioApplied && 
        (!this.activeScenario.injectAtSec || this.t >= this.activeScenario.injectAtSec)) {
      const delta = this.activeScenario.delta;
      if (delta.pf !== undefined) pf += delta.pf;
      if (delta.tap !== undefined) tap += delta.tap;
      if (delta.thd !== undefined) thd += delta.thd;
      if (delta.foamIdx !== undefined) foamIdx = Math.max(0, Math.min(1, foamIdx + delta.foamIdx));
      if (delta.tempC !== undefined) tempC += delta.tempC;
      this.scenarioApplied = true;
      
      // Emit scenario injection event
      this.emit("scenario_injected", {
        scenario: this.activeScenario,
        timestamp: Date.now()
      });
    }
    
    // Stage transitions
    if (this.t === 120 || this.t === 900) {
      this.nextStage();
    }
    
    // Chemistry simulation for steel production
    let cPct = this.stage === "REFINE" ? 
      0.08 + (this.rnd() - 0.5) * 0.02 : 
      0.12 + (this.rnd() - 0.5) * 0.04;
    let oPct = this.stage === "REFINE" ? 
      0.015 + (this.rnd() - 0.5) * 0.005 : 
      0.025 + (this.rnd() - 0.5) * 0.01;
      
    // Apply chemistry deltas from scenario
    if (this.activeScenario && this.scenarioApplied) {
      const delta = this.activeScenario.delta;
      if (delta.cPct !== undefined) cPct += delta.cPct;
      if (delta.oPct !== undefined) oPct += delta.oPct;
    }
    
    const tick: HeatTick = {
      ts: Date.now(),
      stage: this.stage,
      tempC,
      kwhTotal: this.kwh,
      kwhPerT,
      pf,
      tap,
      thd,
      foamIdx,
      cPct,
      oPct,
      note: this.activeScenario?.delta.note
    };
    
    this.emit("data", tick);
    return tick;
  }
  
  getStatus() {
    return {
      time: this.t,
      stage: this.stage,
      mass: this.massT,
      totalKwh: this.kwh
    };
  }
  
  reset() {
    this.t = 0;
    this.kwh = 0;
    this.stage = "BOR";
    this.activeScenario = null;
    this.scenarioApplied = false;
  }
  
  injectScenario(scenario: ScenarioInjection) {
    this.activeScenario = scenario;
    this.scenarioApplied = false;
    console.log(`Scenario "${scenario.id}" queued for injection`);
  }
  
  clearScenario() {
    this.activeScenario = null;
    this.scenarioApplied = false;
  }
  
  applyRecovery() {
    if (this.activeScenario?.recommendation) {
      // Reset parameters to normal operation
      this.activeScenario = null;
      this.scenarioApplied = false;
      this.emit("recovery_applied", {
        timestamp: Date.now(),
        message: "Recovery actions applied successfully"
      });
      console.log("Recovery actions applied - returning to normal operation");
    }
  }
}