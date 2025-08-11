import { describe, test, expect } from '@jest/globals';
import { insightFor } from '../../server/ai/insight-static';
import type { HeatTick } from '../../server/demo/heat-sim';

const baseTick: HeatTick = {
  ts: Date.now(), 
  stage: 'MELT', 
  tempC: 1200, 
  kwhTotal: 10, 
  kwhPerT: 0.50,
  pf: 0.82, 
  tap: 9, 
  thd: 4.5, 
  foamIdx: 0.6, 
  cPct: 0.012, 
  oPct: 0.02
};

describe('Deterministic insights', () => {
  test('flags foam collapse risk', () => {
    const t = { ...baseTick, foamIdx: 0.3, thd: 5.6 };
    const ins = insightFor(t);
    expect(ins.title.toLowerCase()).toContain('foam');
    expect(ins.action.length).toBeGreaterThan(0);
  });

  test('flags energy inefficiency above baseline', () => {
    const t = { ...baseTick, kwhPerT: 0.61 };
    const ins = insightFor(t);
    expect(ins.title.toLowerCase()).toContain('energy');
  });
});