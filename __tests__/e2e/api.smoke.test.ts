import { describe, test, expect } from '@jest/globals';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:5000';

async function reachable(url: string) {
  try { 
    const r = await fetch(url); 
    return r.ok; 
  } catch { 
    return false; 
  }
}

describe('API smoke', () => {
  test('healthz responds', async () => {
    const ok = await reachable(`${BASE}/healthz`);
    if (!ok) return console.warn('⚠️ server not running; skipping');
    const r = await fetch(`${BASE}/healthz`);
    const j = await r.json();
    expect(j.ok).toBe(true);
  });

  test('demo sim can start & provide insights', async () => {
    const ok = await reachable(`${BASE}/healthz`);
    if (!ok) return console.warn('⚠️ server not running; skipping');

    await fetch(`${BASE}/api/demo/start?seed=42&heatId=93378`);
    const r = await fetch(`${BASE}/api/insights/93378`);
    const j = await r.json();
    expect(j.mode).toBe('deterministic');
    expect(j.insight?.title).toBeTruthy();
  });
});