/**
 * Phase 3: LF→CC Sync Guard with € mapping - ATDD Tests
 * 
 * Tests for the CFO hook functionality that transforms metallurgy drift into money
 */

import { syncGuard, syncDecisionLog, type RouteETA } from '../../../server/models/sync';

describe('Phase 3: LF→CC Sync Guard with € mapping', () => {
  beforeEach(() => {
    // Reset decision log for each test
    syncDecisionLog['decisions'] = [];
  });

  describe('Feature: LF/CC Sync Guard with Euro mapping', () => {
    test('Scenario: Late caster shows ΔT and cost', () => {
      // Given the caster is 6 minutes late
      const route: RouteETA = {
        eta_LF: 2,        // Ladle ready in 2 minutes
        eta_CC: 10,       // Caster available in 10 minutes (6 minutes late)
        eta_target: 4,    // Target was 4 minutes
        route_id: 'LF2→CC1'
      };

      // When Sync Guard evaluates transfer
      const analysis = syncGuard.analyzeRoute(route);

      // Then it shows Predicted ΔT of at least 10°C
      expect(analysis.baseline_impact.predicted_deltaT).toBeGreaterThanOrEqual(10);
      
      // And it shows an added cost of at least €150 per heat
      expect(analysis.baseline_impact.cost_per_heat).toBeGreaterThanOrEqual(150);
      
      // And it rolls up the impact to per-day and per-year totals
      expect(analysis.baseline_impact.cost_per_day).toBeGreaterThan(0);
      expect(analysis.baseline_impact.cost_per_year).toBeGreaterThan(0);
      
      // Verify specific calculations
      const delay_minutes = route.eta_CC - route.eta_target; // 6 minutes
      const expected_deltaT = delay_minutes * 1.8; // 1.8°C per minute = 10.8°C
      const expected_cost = (expected_deltaT / 10) * 150; // (10.8/10) * 150 = €162
      
      expect(analysis.baseline_impact.predicted_deltaT).toBe(expected_deltaT);
      expect(analysis.baseline_impact.cost_per_heat).toBe(expected_cost);
      
      // Verify daily/annual rollup
      expect(analysis.baseline_impact.cost_per_day).toBe(expected_cost * 24);
      expect(analysis.baseline_impact.cost_per_year).toBe(expected_cost * 24 * 350);
    });

    test('Scenario: Choosing a mitigation updates the economics', () => {
      // Given Sync Guard proposes "Boost superheat now" and "Coordinate LF/CC"
      const route: RouteETA = {
        eta_LF: 2,
        eta_CC: 8,        // 4 minutes late
        eta_target: 4,
        route_id: 'LF1→CC2'
      };

      const analysis = syncGuard.analyzeRoute(route);
      const baseline_cost = analysis.baseline_impact.cost_per_heat;
      
      // Verify both mitigation options are provided
      expect(analysis.mitigation_options).toHaveLength(2);
      
      const boostOption = analysis.mitigation_options.find(m => m.id === 'boost');
      const coordinateOption = analysis.mitigation_options.find(m => m.id === 'coordinate');
      
      expect(boostOption).toBeDefined();
      expect(coordinateOption).toBeDefined();
      expect(boostOption!.name).toBe('Boost superheat now');
      expect(coordinateOption!.name).toBe('Coordinate LF/CC');

      // When I click "Coordinate LF/CC"
      const chosenMitigation = coordinateOption!;
      const final_impact = syncGuard.applyMitigation(
        analysis.route,
        analysis.baseline_impact,
        chosenMitigation
      );

      // Then the Predicted ΔT decreases
      expect(final_impact.predicted_deltaT).toBeLessThan(analysis.baseline_impact.predicted_deltaT);
      
      // And the Euro impact per heat decreases accordingly
      const temperature_cost = (final_impact.predicted_deltaT / 10) * 150;
      const total_final_cost = temperature_cost + chosenMitigation.energy_cost;
      expect(total_final_cost).toBeLessThan(baseline_cost);

      // And the decision is logged with a timestamp
      const decision = {
        timestamp: Date.now(),
        route_id: route.route_id,
        original_impact: analysis.baseline_impact,
        chosen_mitigation: chosenMitigation,
        final_impact,
        operator: 'Test Operator'
      };

      syncDecisionLog.logDecision(decision);
      
      const logged_decisions = syncDecisionLog.getDecisions(route.route_id);
      expect(logged_decisions).toHaveLength(1);
      expect(logged_decisions[0].chosen_mitigation?.id).toBe('coordinate');
      expect(logged_decisions[0].timestamp).toBeGreaterThan(0);
    });
  });

  describe('Financial Impact Calculations', () => {
    test('should correctly map temperature loss to cost', () => {
      const route: RouteETA = {
        eta_LF: 1,
        eta_CC: 6,        // 5 minutes late
        eta_target: 1,
        route_id: 'TEST'
      };

      const analysis = syncGuard.analyzeRoute(route);
      
      // 5 minutes * 1.8°C/min = 9°C loss
      // 9°C * (€150 / 10°C) = €135
      expect(analysis.baseline_impact.predicted_deltaT).toBe(9.0);
      expect(analysis.baseline_impact.cost_per_heat).toBe(135);
    });

    test('should roll up costs to daily and annual figures', () => {
      const route: RouteETA = {
        eta_LF: 0,
        eta_CC: 3,
        eta_target: 1,    // 2 minutes delay
        route_id: 'TEST'
      };

      const analysis = syncGuard.analyzeRoute(route);
      const cost_per_heat = analysis.baseline_impact.cost_per_heat;
      
      // Daily: cost_per_heat * 24 heats
      expect(analysis.baseline_impact.cost_per_day).toBe(cost_per_heat * 24);
      
      // Annual: daily * 350 working days
      expect(analysis.baseline_impact.cost_per_year).toBe(cost_per_heat * 24 * 350);
    });
  });

  describe('Mitigation Options', () => {
    test('Boost superheat should have energy cost but reduce temperature loss', () => {
      const route: RouteETA = {
        eta_LF: 1,
        eta_CC: 7,        // 6 minutes late
        eta_target: 1,
        route_id: 'TEST'
      };

      const analysis = syncGuard.analyzeRoute(route);
      const boost_option = analysis.mitigation_options.find(m => m.id === 'boost')!;
      
      // Should have energy cost
      expect(boost_option.energy_cost).toBe(25);
      
      // Should reduce temperature loss
      expect(boost_option.deltaT_reduction).toBeGreaterThan(0);
      
      // Should have positive time impact (takes longer)
      expect(boost_option.time_impact).toBe(2);
    });

    test('Coordinate LF/CC should have no energy cost but reduce delay', () => {
      const route: RouteETA = {
        eta_LF: 1,
        eta_CC: 6,        // 5 minutes late
        eta_target: 1,
        route_id: 'TEST'
      };

      const analysis = syncGuard.analyzeRoute(route);
      const coordinate_option = analysis.mitigation_options.find(m => m.id === 'coordinate')!;
      
      // Should have no energy cost
      expect(coordinate_option.energy_cost).toBe(0);
      
      // Should reduce temperature loss
      expect(coordinate_option.deltaT_reduction).toBeGreaterThan(0);
      
      // Should have negative time impact (reduces delay)
      expect(coordinate_option.time_impact).toBeLessThan(0);
    });
  });

  describe('Decision Logging', () => {
    test('should track total savings across decisions', () => {
      // Log multiple decisions with different savings
      const decision1 = {
        timestamp: Date.now(),
        route_id: 'LF1→CC1',
        original_impact: { cost_per_heat: 150, cost_per_day: 3600, cost_per_year: 1260000, predicted_deltaT: 10 },
        chosen_mitigation: { id: 'boost' as const, name: 'Boost', description: '', energy_cost: 25, deltaT_reduction: 8, time_impact: 2, net_cost: 50 },
        final_impact: { cost_per_heat: 75, cost_per_day: 1800, cost_per_year: 630000, predicted_deltaT: 2 },
        operator: 'Test'
      };

      const decision2 = {
        timestamp: Date.now() + 1000,
        route_id: 'LF2→CC1', 
        original_impact: { cost_per_heat: 120, cost_per_day: 2880, cost_per_year: 1008000, predicted_deltaT: 8 },
        chosen_mitigation: { id: 'coordinate' as const, name: 'Coordinate', description: '', energy_cost: 0, deltaT_reduction: 6, time_impact: -2, net_cost: 30 },
        final_impact: { cost_per_heat: 50, cost_per_day: 1200, cost_per_year: 420000, predicted_deltaT: 2 },
        operator: 'Test'
      };

      syncDecisionLog.logDecision(decision1);
      syncDecisionLog.logDecision(decision2);

      const totalSavings = syncDecisionLog.getTotalSavings();
      
      // Should calculate total daily savings across both decisions
      const expected_daily = (150 - 75) + (120 - 50); // 75 + 70 = 145
      expect(totalSavings.daily).toBe(expected_daily);
      
      // Annual should be daily * 350
      expect(totalSavings.annual).toBe(expected_daily * 350);
    });

    test('should filter decisions by route ID', () => {
      const route1_decision = {
        timestamp: Date.now(),
        route_id: 'LF1→CC1',
        original_impact: { cost_per_heat: 100, cost_per_day: 2400, cost_per_year: 840000, predicted_deltaT: 6 },
        chosen_mitigation: null,
        final_impact: { cost_per_heat: 100, cost_per_day: 2400, cost_per_year: 840000, predicted_deltaT: 6 },
        operator: 'Test'
      };

      const route2_decision = {
        timestamp: Date.now() + 1000,
        route_id: 'LF2→CC1',
        original_impact: { cost_per_heat: 150, cost_per_day: 3600, cost_per_year: 1260000, predicted_deltaT: 10 },
        chosen_mitigation: null,
        final_impact: { cost_per_heat: 150, cost_per_day: 3600, cost_per_year: 1260000, predicted_deltaT: 10 },
        operator: 'Test'
      };

      syncDecisionLog.logDecision(route1_decision);
      syncDecisionLog.logDecision(route2_decision);

      const route1_decisions = syncDecisionLog.getDecisions('LF1→CC1');
      expect(route1_decisions).toHaveLength(1);
      expect(route1_decisions[0].route_id).toBe('LF1→CC1');

      const all_decisions = syncDecisionLog.getDecisions();
      expect(all_decisions).toHaveLength(2);
    });
  });

  describe('Configuration', () => {
    test('should allow updating temperature loss rate and cost mapping', () => {
      // Update configuration
      syncGuard.updateConfig({
        dT_per_min: 2.0,      // Higher temperature loss rate
        cost_per_10C: 200     // Higher cost per 10°C
      });

      const route: RouteETA = {
        eta_LF: 1,
        eta_CC: 3,        // 2 minutes late
        eta_target: 1,
        route_id: 'TEST'
      };

      const analysis = syncGuard.analyzeRoute(route);
      
      // Should use new rate: 2 minutes * 2.0°C/min = 4°C
      expect(analysis.baseline_impact.predicted_deltaT).toBe(4.0);
      
      // Should use new cost: 4°C * (€200 / 10°C) = €80
      expect(analysis.baseline_impact.cost_per_heat).toBe(80);

      // Reset to defaults for other tests
      syncGuard.updateConfig({
        dT_per_min: 1.8,
        cost_per_10C: 150
      });
    });
  });
});