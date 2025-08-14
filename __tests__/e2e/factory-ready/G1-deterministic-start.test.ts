/**
 * ATDD Test: G1 Deterministic Start (No Clicks)
 * Factory-Ready Go/No-Go Gate #1
 * 
 * Addresses Conny 4.0's brutal assessment:
 * "Empty cards are presentation killers in steel industry demos"
 */

import { describe, test, expect, beforeAll } from '@jest/globals';

describe('G1: Deterministic Auto-Start', () => {
  
  test('Page loads with running simulation automatically', async () => {
    // GIVEN: User navigates to demo URL
    const response = await fetch('http://localhost:5000/');
    expect(response.status).toBe(200);

    // WHEN: Page loads
    // Auto-start should trigger within component mount
    
    // THEN: Simulation auto-starts with seed=42
    await new Promise(resolve => setTimeout(resolve, 1000)); // Allow auto-start
    
    const statusResponse = await fetch('http://localhost:5000/api/demo/status');
    expect(statusResponse.status).toBe(200);
    
    const status = await statusResponse.json();
    expect(status.running).toBe(true);
    expect(status.heatId).toBe(93378);
  });

  test('Heat data appears within 5 seconds', async () => {
    // GIVEN: Page loads
    const startTime = Date.now();
    
    // WHEN: Auto-start triggers
    const response = await fetch('http://localhost:5000/api/demo/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seed: 42, heatId: 93378 })
    });
    
    expect(response.status).toBe(200);
    
    // THEN: Heat data available within 5 seconds
    const endTime = Date.now();
    const duration = endTime - startTime;
    expect(duration).toBeLessThan(5000);
    
    const heatData = await response.json();
    expect(heatData.heatId).toBe(93378);
    expect(heatData.stage).toBeDefined();
    expect(heatData.confidence).toBeGreaterThan(0);
  });

  test('Zero empty cards or waiting states', async () => {
    // GIVEN: Fresh page load
    // WHEN: Auto-start completes
    const response = await fetch('http://localhost:5000/api/demo/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seed: 42, heatId: 93378 })
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    
    // THEN: No empty states
    expect(data.heatId).toBeTruthy();
    expect(data.stage).toBeTruthy();
    expect(data.confidence).toBeGreaterThan(0);
    expect(data.temperature).toBeGreaterThan(0);
    expect(data.powerFactor).toBeGreaterThan(0);
  });

  test('Deep-links work with URL parameters', async () => {
    // GIVEN: URL with parameters
    const testParams = {
      seed: 42,
      heatId: 93378,
      scenario: 'energy-spike'
    };
    
    // WHEN: Auto-start with parameters
    const response = await fetch('http://localhost:5000/api/demo/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testParams)
    });
    
    expect(response.status).toBe(200);
    
    // THEN: Parameters are applied
    const result = await response.json();
    expect(result.heatId).toBe(testParams.heatId);
    expect(result.seed).toBe(testParams.seed);
  });

  test('CRITICAL: No presentation killer empty cards', async () => {
    // This is the core requirement that Conny 4.0 flagged as critical
    
    // GIVEN: Steel industry executive watches demo
    // WHEN: Presenter opens application
    const response = await fetch('http://localhost:5000/api/demo/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seed: 42, heatId: 93378 })
    });
    
    // THEN: Every card has meaningful data immediately
    expect(response.status).toBe(200);
    
    const data = await response.json();
    
    // Core metrics must be present (no empty cards)
    expect(data.heatId).toBe(93378);
    expect(data.stage).toMatch(/MELT|REFINE|TAP/);
    expect(data.temperature).toBeGreaterThan(1400); // Realistic steel temp
    expect(data.confidence).toBeGreaterThanOrEqual(75); // Minimum trust level
    expect(data.powerFactor).toBeGreaterThan(0.5); // Realistic PF
    expect(data.foamIndex).toBeDefined(); // Industry-specific metric
    
    // Timeline must show progress
    expect(data.timeline).toBeDefined();
    expect(Array.isArray(data.timeline)).toBe(true);
    expect(data.timeline.length).toBeGreaterThan(0);
    
    console.log('✅ G1 CRITICAL: All cards populated with realistic steel data');
  });

});

export default {};