import { describe, test, expect } from '@jest/globals';
import { computeROI, DEFAULT_BASELINE, DEFAULT_PRICES } from '../../server/roi';

describe('ROI computation', () => {
  test('computes positive savings with better current performance', () => {
    const current = {
      kwhPerT: DEFAULT_BASELINE.kwhPerT - 20, // energy improvement
      minPerHeat: DEFAULT_BASELINE.minPerHeat - 2, // time improvement
      electrodeKgPerHeat: DEFAULT_BASELINE.electrodeKgPerHeat - 0.5 // electrode improvement
    };
    const roi = computeROI(DEFAULT_BASELINE, current, DEFAULT_PRICES);
    expect(roi.perHeat).toBeGreaterThan(0);
    expect(roi.perMonth).toBeGreaterThan(roi.perHeat);
    expect(roi.details.energyDelta).toBeCloseTo(20, 1);
  });

  test('returns zero if current is worse than baseline', () => {
    const current = {
      kwhPerT: DEFAULT_BASELINE.kwhPerT + 50,
      minPerHeat: DEFAULT_BASELINE.minPerHeat + 5,
      electrodeKgPerHeat: DEFAULT_BASELINE.electrodeKgPerHeat + 1
    };
    const roi = computeROI(DEFAULT_BASELINE, current, DEFAULT_PRICES);
    expect(roi.perHeat).toBe(0);
    expect(roi.breakdown.energySaving).toBe(0);
  });
});