import type { HeatTick } from "../demo/heat-sim";

export interface StaticInsight {
  title: string;
  why: string[];
  action: string[];
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'energy' | 'quality' | 'safety' | 'operational';
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
      category: 'safety'
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
      category: 'operational'
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
      category: 'energy'
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
      category: 'quality'
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
      category: 'operational'
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
      category: 'quality'
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
      category: 'operational'
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
    category: 'operational'
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