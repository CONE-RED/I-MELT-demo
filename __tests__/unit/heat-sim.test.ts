import { describe, test, expect } from '@jest/globals';
import { HeatSim } from '../../server/demo/heat-sim';

describe('HeatSim determinism & scenarios', () => {
  test('same seed yields same sequence', () => {
    const s1 = new HeatSim(42), s2 = new HeatSim(42);
    const seq1 = Array.from({length: 10}, () => s1.tick().tempC);
    const seq2 = Array.from({length: 10}, () => s2.tick().tempC);
    expect(seq1).toEqual(seq2);
  });

  test('scenario injection & recovery', () => {
    const sim = new HeatSim(42);
    for (let i=0;i<420;i++) sim.tick(); // advance to ~7min
    sim.injectScenario({
      id: 'energy-spike',
      injectAtSec: 0,
      delta: { pf: -0.08, thd: +1.5, foamIdx: -0.2, note: 'Injected' }
    });
    const before = sim.tick();
    expect(before.pf).toBeLessThan(0.82);
    sim.applyRecovery();
    const after = sim.tick();
    expect(after.pf).toBeGreaterThan(before.pf); // back toward nominal
  });
});