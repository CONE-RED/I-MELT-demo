import type { HeatTick } from "../demo/heat-sim";

export interface ExpectedImpact {
  kwhPerT: number;        // Energy impact (delta)
  timeMin: number;        // Time impact in minutes (delta)
  cost: number;           // Cost impact per heat (delta €)
  description: string;    // Human readable impact
}

export interface StaticInsight {
  title: string;
  why: string[];                    // WHY-now bullets (PF drift, THD↑, Foam↓)
  action: string[];                 // Specific actions to take
  confidence: number;               // 0.0 to 1.0
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'energy' | 'quality' | 'safety' | 'operational';
  expectedImpact: ExpectedImpact;   // Quantified impact for operators
  applyable: boolean;               // Can this be applied automatically?
}

/**
 * Deterministic AI insights mapped from simulation state
 * No LLM calls - instant responses for decision maker demos
 */
export function insightFor(t: HeatTick): StaticInsight {
  
  // Critical safety alerts first
  if (t.tempC > 1680 && t.stage === "REFINE") {
    return {
      title: "Critical: Superheat risk to caster",
      why: [
        `Steel temperature ${Math.round(t.tempC)}°C exceeds safe casting limit`,
        "Caster refractory damage imminent",
        "Strand shell quality at risk"
      ],
      action: [
        "Stop heating immediately",
        "Reduce tap position to 5",
        "Add limestone flux 8kg",
        "Notify caster operator"
      ],
      confidence: 0.96,
      severity: 'critical',
      category: 'safety',
      expectedImpact: {
        kwhPerT: 0,         // No energy impact - safety first
        timeMin: 5.2,       // Extends heat by 5+ minutes
        cost: -1850,        // High cost to avoid €50k+ refractory damage
        description: "Prevents catastrophic caster damage (€50k+ avoided)"
      },
      applyable: true
    };
  }
  
  // Foam collapse early warning
  if (t.foamIdx < 0.35 && t.stage === "MELT") {
    return {
      title: "Early Warning: Foam collapse imminent",
      why: [
        "THD rising beyond stable range",
        `Foam index ${(t.foamIdx * 100).toFixed(0)}% below critical threshold`,
        "Power factor drift indicating instability"
      ],
      action: [
        "Add 6kg carbon in 2 pulses",
        "Switch to Tap 7 for 3 minutes",
        "Monitor electrode exposure"
      ],
      confidence: 0.84,
      severity: 'high',
      category: 'operational',
      expectedImpact: {
        kwhPerT: -12.5,     // Reduces energy by improving arc stability
        timeMin: -1.8,      // Prevents 2min melt time extension
        cost: 950,          // Save €950 through faster melt + lower energy
        description: "Prevents foam collapse → saves 2min melt time"
      },
      applyable: true
    };
  }
  
  // Energy inefficiency detection
  if (t.kwhPerT > 0.58) { // 580 kWh/t baseline is 0.58
    return {
      title: "Energy inefficiency detected",
      why: [
        `Energy consumption ${(t.kwhPerT * 1000).toFixed(1)} kWh/t above baseline 540`,
        `Power factor ${t.pf.toFixed(2)} suboptimal`,
        "Electrical losses increasing operational cost"
      ],
      action: [
        "Improve power factor to 0.86",
        "Reduce flicker via tap position 7",
        "Check electrode positioning"
      ],
      confidence: 0.78,
      severity: 'medium',
      category: 'energy',
      expectedImpact: {
        kwhPerT: -7.5,      // Reduces energy consumption by 7.5 kWh/t
        timeMin: 0,         // No direct time impact
        cost: 420,          // Save €420 through reduced energy cost
        description: "Power factor optimization → 7.5 kWh/t energy reduction"
      },
      applyable: true
    };
  }
  
  // Chemistry quality alerts
  if (t.cPct !== undefined && t.cPct > 0.15 && t.stage === "REFINE") {
    return {
      title: "Carbon content exceeding grade specification",
      why: [
        `Carbon ${(t.cPct * 100).toFixed(2)}% above target 0.12% for grade`,
        "Decarburization rate insufficient",
        "Final chemistry at risk"
      ],
      action: [
        "Increase oxygen lance time",
        "Raise temperature to 1650°C",
        "Sample for laboratory confirmation"
      ],
      confidence: 0.81,
      severity: 'medium',
      category: 'quality',
      expectedImpact: {
        kwhPerT: 3.2,       // Slight energy increase for higher temperature
        timeMin: 4.5,       // Extends refining by ~4 minutes
        cost: -280,         // Cost to avoid €5000+ grade rejection
        description: "Prevents off-grade steel → avoids €5k+ rejection cost"
      },
      applyable: true
    };
  }
  
  // Power quality issues
  if (t.thd > 5.5) {
    return {
      title: "Power quality degradation",
      why: [
        `THD ${t.thd.toFixed(1)}% exceeding grid stability limits`,
        "Electrode arc instability",
        "Potential equipment stress"
      ],
      action: [
        "Stabilize electrode positions",
        "Check transformer tap settings",
        "Reduce power if necessary"
      ],
      confidence: 0.87,
      severity: 'high',
      category: 'operational',
      expectedImpact: {
        kwhPerT: -2.1,      // Stabilization reduces arc losses
        timeMin: 0.8,       // Slight time extension for stabilization
        cost: 320,          // Prevent grid penalties + equipment wear
        description: "Arc stabilization → prevents grid penalties"
      },
      applyable: true
    };
  }
  
  // Oxygen level concerns
  if (t.oPct !== undefined && t.oPct > 0.035 && t.stage === "REFINE") {
    return {
      title: "Oxygen levels requiring attention",
      why: [
        `Dissolved oxygen ${(t.oPct * 1000).toFixed(0)}ppm above specification`,
        "Steel cleanliness at risk",
        "Inclusion formation potential"
      ],
      action: [
        "Add aluminum wire deoxidizer",
        "Increase silicon addition",
        "Check ladle preparation"
      ],
      confidence: 0.79,
      severity: 'medium',
      category: 'quality',
      expectedImpact: {
        kwhPerT: 0.8,       // Minor energy for alloy additions
        timeMin: 2.3,       // Brief addition time
        cost: -150,         // Material cost vs quality improvement
        description: "Steel cleanliness → prevents inclusion-related rejections"
      },
      applyable: true
    };
  }
  
  // Stage transition optimization
  if (t.stage === "BOR" && t.tempC > 1200) {
    return {
      title: "Ready for melting phase transition",
      why: [
        "Bore-out temperature targets achieved",
        "Scrap melting progressing well",
        "Power levels stable for transition"
      ],
      action: [
        "Initiate flat bath melting",
        "Increase tap to position 8",
        "Monitor foam development"
      ],
      confidence: 0.89,
      severity: 'low',
      category: 'operational',
      expectedImpact: {
        kwhPerT: -1.5,      // Earlier transition saves energy
        timeMin: -2.8,      // Faster transition saves time
        cost: 180,          // Faster heat = higher throughput
        description: "Optimal transition timing → 3min time savings"
      },
      applyable: true
    };
  }
  
  // Default operational status
  return {
    title: "Operations nominal - on plan",
    why: [
      "All parameters within specification",
      "Heat progressing to target",
      "No immediate action required"
    ],
    action: [
      "Maintain current settings",
      "Continue monitoring",
      "Prepare for next stage"
    ],
    confidence: 0.92,
    severity: 'low',
    category: 'operational',
    expectedImpact: {
      kwhPerT: 0,         // No change - maintaining baseline
      timeMin: 0,         // No time impact
      cost: 0,            // Baseline cost
      description: "Maintaining optimal performance baseline"
    },
    applyable: false    // No action needed when nominal
  };
}

/**
 * Get confidence color for UI display
 */
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.9) return 'text-green-600';
  if (confidence >= 0.8) return 'text-blue-600';
  if (confidence >= 0.7) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Get severity color for UI display
 */
export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return 'text-red-600 bg-red-50';
    case 'high': return 'text-orange-600 bg-orange-50';
    case 'medium': return 'text-yellow-600 bg-yellow-50';
    case 'low': return 'text-green-600 bg-green-50';
    default: return 'text-gray-600 bg-gray-50';
  }
}