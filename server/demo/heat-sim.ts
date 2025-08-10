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

export class HeatSim extends EventEmitter {
  private rnd: () => number;
  private t = 0;
  private massT = 85;
  private kwh = 0;
  private stage: "BOR" | "MELT" | "REFINE" | "TAP" = "BOR";
  
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
    const pf = 0.82 + this.rnd() * 0.06;
    const tap = this.stage === "MELT" ? 9 : this.stage === "REFINE" ? 7 : 6;
    const powerMW = (this.stage === "MELT" ? 65 : 45) * pf;
    this.kwh += powerMW / 3600;
    const thd = 2 + (this.stage === "MELT" ? 4 : 2) + this.rnd() * 0.5;
    const foamIdx = Math.max(0, Math.min(1, 
      0.5 + (this.stage === "MELT" ? 0.3 : 0.1) + 
      (thd - 4) / 10 + (this.rnd() - 0.5) * 0.1
    ));
    const tempC = 20 + Math.min(1650, 
      3 * this.t + (this.stage === "REFINE" ? 150 : 0) + (foamIdx * 40)
    );
    const kwhPerT = this.kwh / this.massT;
    
    // Stage transitions
    if (this.t === 120 || this.t === 900) {
      this.nextStage();
    }
    
    // Chemistry simulation for steel production
    const cPct = this.stage === "REFINE" ? 
      0.08 + (this.rnd() - 0.5) * 0.02 : 
      0.12 + (this.rnd() - 0.5) * 0.04;
    const oPct = this.stage === "REFINE" ? 
      0.015 + (this.rnd() - 0.5) * 0.005 : 
      0.025 + (this.rnd() - 0.5) * 0.01;
    
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
      oPct
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
  }
}