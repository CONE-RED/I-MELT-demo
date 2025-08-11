export interface Baseline {
  kwhPerT: number;
  minPerHeat: number;
  heatsPerDay: number;
  electrodeKgPerHeat: number;
  massT: number;
}

export interface Current {
  kwhPerT: number;
  minPerHeat: number;
  electrodeKgPerHeat: number;
}

export interface Prices {
  kwh: number; // €/kWh
  electrode: number; // €/kg
  prodValuePerMin: number; // €/min lost casting time
}

export interface ROIResult {
  perHeat: number;
  perMonth: number;
  breakdown: {
    energySaving: number;
    timeSaving: number;
    electrodeSaving: number;
  };
  details: {
    energyDelta: number; // kWh/t difference
    timeDelta: number; // min/heat difference
    electrodeDelta: number; // kg/heat difference
  };
}

// Conservative industry defaults from European steel producers
export const DEFAULT_BASELINE: Baseline = {
  kwhPerT: 475, // Typical EAF consumption
  minPerHeat: 65, // Standard tap-to-tap time
  heatsPerDay: 12, // 2-shift operation
  electrodeKgPerHeat: 4.2, // Industry average
  massT: 85 // Standard heat size
};

export const DEFAULT_PRICES: Prices = {
  kwh: 0.11, // €0.11/kWh (European industrial rate)
  electrode: 7.0, // €7/kg (graphite electrode cost)
  prodValuePerMin: 650 // €650/min (lost casting revenue)
};

export function computeROI(baseline: Baseline, current: Current, prices: Prices): ROIResult {
  // Calculate deltas
  const energyDelta = baseline.kwhPerT - current.kwhPerT;
  const timeDelta = baseline.minPerHeat - current.minPerHeat;
  const electrodeDelta = baseline.electrodeKgPerHeat - current.electrodeKgPerHeat;
  
  // Calculate savings per heat
  const energySaving = Math.max(0, energyDelta * baseline.massT * prices.kwh);
  const timeSaving = Math.max(0, timeDelta * prices.prodValuePerMin);
  const electrodeSaving = Math.max(0, electrodeDelta * prices.electrode);
  
  const perHeat = energySaving + timeSaving + electrodeSaving;
  const perMonth = perHeat * baseline.heatsPerDay * 30;
  
  return {
    perHeat,
    perMonth,
    breakdown: {
      energySaving,
      timeSaving,
      electrodeSaving
    },
    details: {
      energyDelta,
      timeDelta,
      electrodeDelta
    }
  };
}

export function generateROIReport(baseline: Baseline, current: Current, prices: Prices): string {
  const roi = computeROI(baseline, current, prices);
  
  const report = `
# I-MELT ROI Analysis Report
**Generated:** ${new Date().toLocaleDateString('en-EU')}

## Executive Summary
**Monthly Savings:** €${roi.perMonth.toLocaleString('en-EU', { maximumFractionDigits: 0 })}
**Per Heat Savings:** €${roi.perHeat.toFixed(2)}
**Annual Projection:** €${(roi.perMonth * 12).toLocaleString('en-EU', { maximumFractionDigits: 0 })}

## Performance Improvements
| Metric | Baseline | Optimized | Improvement |
|--------|----------|-----------|-------------|
| Energy Consumption | ${baseline.kwhPerT} kWh/t | ${current.kwhPerT} kWh/t | ${roi.details.energyDelta.toFixed(1)} kWh/t |
| Heat Duration | ${baseline.minPerHeat} min | ${current.minPerHeat} min | ${roi.details.timeDelta.toFixed(1)} min |
| Electrode Consumption | ${baseline.electrodeKgPerHeat} kg/heat | ${current.electrodeKgPerHeat} kg/heat | ${roi.details.electrodeDelta.toFixed(1)} kg/heat |

## Savings Breakdown (Per Month)
- **Energy Savings:** €${(roi.breakdown.energySaving * baseline.heatsPerDay * 30).toLocaleString('en-EU', { maximumFractionDigits: 0 })}
- **Time Savings:** €${(roi.breakdown.timeSaving * baseline.heatsPerDay * 30).toLocaleString('en-EU', { maximumFractionDigits: 0 })}
- **Electrode Savings:** €${(roi.breakdown.electrodeSaving * baseline.heatsPerDay * 30).toLocaleString('en-EU', { maximumFractionDigits: 0 })}

## Assumptions
- Production Rate: ${baseline.heatsPerDay} heats/day
- Heat Size: ${baseline.massT} tonnes
- Energy Price: €${prices.kwh}/kWh
- Electrode Price: €${prices.electrode}/kg
- Production Value: €${prices.prodValuePerMin}/min

*Analysis based on I-MELT system performance vs. conventional EAF operation*
`;
  
  return report.trim();
}