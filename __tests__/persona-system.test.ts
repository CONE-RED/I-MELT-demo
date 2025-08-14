/**
 * Persona System Testing
 * Day 4: Validates that different personas see different content
 */

import { HeroInsightCalculator } from '../client/src/lib/HeroInsightCalculator';

describe('Persona System Implementation', () => {
  const mockHeatData = {
    heat: 93378,
    grade: 'S235JR',
    confidence: 92,
    chemSteel: {
      C: 0.12,
      Si: 0.25,
      Mn: 1.35,
      P: 0.018,
      S: 0.022
    }
  };

  test('CFO persona shows cost-focused insights', () => {
    const insight = HeroInsightCalculator.calculateHeroInsight(mockHeatData, 'cfo');
    
    expect(insight.title).toContain('Cost');
    expect(insight.value).toContain('€');
    expect(insight.unit).toContain('month');
    expect(insight.actionLabel).toBe('Implement Savings');
    expect(insight.context).toContain('operating costs');
  });

  test('Manager persona shows efficiency-focused insights', () => {
    const insight = HeroInsightCalculator.calculateHeroInsight(mockHeatData, 'manager');
    
    expect(insight.title).toContain('Efficiency');
    expect(insight.unit).toContain('gain');
    expect(insight.context).toContain('improvements');
  });

  test('Metallurgist persona shows technical insights', () => {
    const insight = HeroInsightCalculator.calculateHeroInsight(mockHeatData, 'metallurgist');
    
    expect(insight.title).toContain('Process');
    expect(insight.value).toContain('kWh/t');
    expect(insight.context).toContain('Chemistry');
  });

  test('Operator persona shows operational insights', () => {
    const insight = HeroInsightCalculator.calculateHeroInsight(mockHeatData, 'operator');
    
    expect(insight.title).toContain('Energy Savings');
    expect(insight.actionLabel).toBe('Optimize Energy');
    expect(insight.unit).toContain('heat');
  });

  test('Default persona falls back to operator view', () => {
    const insight = HeroInsightCalculator.calculateHeroInsight(mockHeatData);
    const operatorInsight = HeroInsightCalculator.calculateHeroInsight(mockHeatData, 'operator');
    
    expect(insight.title).toBe(operatorInsight.title);
    expect(insight.actionLabel).toBe(operatorInsight.actionLabel);
  });

  test('All personas receive valid insights with required fields', () => {
    const personas = ['cfo', 'manager', 'metallurgist', 'operator'];
    
    personas.forEach(persona => {
      const insight = HeroInsightCalculator.calculateHeroInsight(mockHeatData, persona);
      
      // Validate required fields
      expect(insight.id).toBeDefined();
      expect(insight.title).toBeDefined();
      expect(insight.message).toBeDefined();
      expect(insight.confidence).toBeGreaterThan(0);
      expect(insight.priority).toMatch(/^(critical|urgent|important|normal)$/);
      expect(typeof insight.actionable).toBe('boolean');
    });
  });
});