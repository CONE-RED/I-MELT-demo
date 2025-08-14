/**
 * HeroInsightCalculator.ts
 * LazyFlow Component: Determines the ONE most critical thing that matters RIGHT NOW
 * 
 * Philosophy: In a sea of data, show users exactly what they need to know and do
 */

import { RootState } from './store';

export interface HeroInsight {
  id: string;
  priority: 'critical' | 'urgent' | 'important' | 'normal';
  title: string;
  message: string;
  value?: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  confidence: number;
  timeRemaining?: string;
  actionable: boolean;
  actionLabel?: string;
  actionType?: 'fix' | 'optimize' | 'monitor' | 'confirm';
  context: string;
  source: 'ai' | 'physics' | 'operator' | 'system';
}

export interface HeatData {
  heat?: number;
  grade?: string;
  confidence?: number;
  modelStatus?: string;
  ts?: string;
  insights?: any[];
  chemSteel?: any;
  stages?: any[];
  buckets?: any[];
}

export class HeroInsightCalculator {
  
  /**
   * Core LazyFlow Method: Calculate the ONE thing that matters most right now
   */
  static calculateHeroInsight(heatData: HeatData, persona?: string): HeroInsight {
    if (!heatData) {
      return this.createDefaultInsight();
    }

    // Priority 1: Critical Safety/Quality Issues
    const criticalIssue = this.checkCriticalIssues(heatData, persona);
    if (criticalIssue) return criticalIssue;

    // Priority 2: Urgent Process Deviations  
    const urgentDeviation = this.checkUrgentDeviations(heatData, persona);
    if (urgentDeviation) return urgentDeviation;

    // Priority 3: Optimization Opportunities
    const optimization = this.checkOptimizationOpportunities(heatData, persona);
    if (optimization) return optimization;

    // Priority 4: Process Monitoring
    const processStatus = this.checkProcessStatus(heatData, persona);
    if (processStatus) return processStatus;

    // Fallback: General status
    return this.createStatusInsight(heatData, persona);
  }

  /**
   * Critical Issues: Immediate action required (foam collapse, temperature spike, etc.)
   */
  private static checkCriticalIssues(heatData: HeatData, persona?: string): HeroInsight | null {
    const criticalInsights = heatData.insights?.filter(i => 
      i.type === 'critical' && !i.acknowledged
    ) || [];

    if (criticalInsights.length > 0) {
      const insight = criticalInsights[0];
      
      // Specific critical scenarios
      if (insight.title?.includes('Foam') || insight.title?.includes('foam')) {
        return {
          id: 'foam-collapse-critical',
          priority: 'critical',
          title: 'Foam Collapse Risk',
          message: 'Foaming index critical - immediate action required',
          value: 'HIGH RISK',
          confidence: 94,
          timeRemaining: '2-3 minutes',
          actionable: true,
          actionLabel: 'Prevent Collapse',
          actionType: 'fix',
          context: 'Foam collapse could disrupt entire heat process',
          source: 'ai'
        };
      }

      if (insight.title?.includes('Temperature') || insight.title?.includes('temp')) {
        return {
          id: 'temperature-critical',
          priority: 'critical',
          title: 'Temperature Crisis',
          message: 'Steel temperature outside safe operating range',
          value: '1650°C',
          unit: '°C',
          trend: 'up',
          confidence: 91,
          timeRemaining: '4-5 minutes',
          actionable: true,
          actionLabel: 'Stabilize Temperature',
          actionType: 'fix',
          context: 'Critical temperature control needed to prevent quality issues',
          source: 'physics'
        };
      }

      // Generic critical insight
      return {
        id: `critical-${insight.id || Date.now()}`,
        priority: 'critical',
        title: insight.title || 'Critical Issue Detected',
        message: insight.message || 'Immediate attention required',
        confidence: insight.confidence || 90,
        actionable: true,
        actionLabel: 'Address Issue',
        actionType: 'fix',
        context: 'Critical process deviation detected',
        source: 'ai'
      };
    }

    return null;
  }

  /**
   * Urgent Deviations: Important but not immediately dangerous
   */
  private static checkUrgentDeviations(heatData: HeatData, persona?: string): HeroInsight | null {
    // Check chemistry deviations
    if (heatData.chemSteel) {
      const { C, S, Si, Mn } = heatData.chemSteel;
      
      // Carbon too low - common urgent issue
      if (C && C < 0.10) {
        return {
          id: 'carbon-low-urgent',
          priority: 'urgent',
          title: 'Carbon Content Low',
          message: 'Carbon below specification - quality impact likely',
          value: (C * 100).toFixed(2),
          unit: '%',
          trend: 'down',
          confidence: 89,
          timeRemaining: '8-12 minutes',
          actionable: true,
          actionLabel: 'Add Carbon',
          actionType: 'optimize',
          context: 'Low carbon affects final steel grade quality',
          source: 'physics'
        };
      }

      // Sulfur too high - quality concern
      if (S && S > 0.025) {
        return {
          id: 'sulfur-high-urgent',
          priority: 'urgent', 
          title: 'Sulfur Content High',
          message: 'Sulfur exceeds target - desulfurization needed',
          value: (S * 100).toFixed(3),
          unit: '%',
          trend: 'up',
          confidence: 87,
          timeRemaining: '10-15 minutes',
          actionable: true,
          actionLabel: 'Reduce Sulfur',
          actionType: 'optimize',
          context: 'High sulfur reduces steel quality and ductility',
          source: 'physics'
        };
      }
    }

    // Check confidence levels
    if (heatData.confidence && heatData.confidence < 75) {
      return {
        id: 'confidence-low-urgent',
        priority: 'urgent',
        title: 'Process Confidence Low',
        message: 'System confidence below optimal threshold',
        value: heatData.confidence,
        unit: '%',
        trend: 'down',
        confidence: heatData.confidence,
        actionable: true,
        actionLabel: 'Improve Monitoring',
        actionType: 'monitor',
        context: 'Low confidence indicates process uncertainty',
        source: 'system'
      };
    }

    return null;
  }

  /**
   * Optimization Opportunities: Ways to improve efficiency/quality
   */
  private static checkOptimizationOpportunities(heatData: HeatData, persona?: string): HeroInsight | null {
    // Energy optimization opportunity - persona-specific messaging
    if (heatData.confidence && heatData.confidence > 90) {
      const personaInsights = {
        cfo: {
          title: 'Cost Reduction Opportunity',
          message: 'Stable process enables immediate cost savings',
          value: '€8,400',
          unit: '/month potential',
          context: 'Optimized energy usage can reduce monthly operating costs significantly'
        },
        manager: {
          title: 'Efficiency Improvement',
          message: 'Process stability allows for KPI optimization',
          value: '12%',
          unit: 'efficiency gain',
          context: 'Current stability enables process improvements without quality risk'
        },
        metallurgist: {
          title: 'Process Optimization',
          message: 'Stable metallurgy allows for parameter refinement',
          value: '2.3kWh/t',
          unit: 'energy reduction',
          context: 'Chemistry stability enables power reduction while maintaining grade specs'
        },
        operator: {
          title: 'Energy Savings Available',
          message: 'Process stable - opportunity to reduce power consumption',
          value: '€847',
          unit: 'savings this heat',
          context: 'Stable process allows for energy reduction without quality impact'
        }
      };
      
      const insight = personaInsights[persona as keyof typeof personaInsights] || personaInsights.operator;
      
      return {
        id: 'energy-optimization',
        priority: 'important',
        title: insight.title,
        message: insight.message,
        value: insight.value,
        unit: insight.unit,
        confidence: 84,
        actionable: true,
        actionLabel: persona === 'cfo' ? 'Implement Savings' : 'Optimize Energy',
        actionType: 'optimize',
        context: insight.context,
        source: 'ai'
      };
    }

    // Chemistry optimization
    if (heatData.chemSteel) {
      const { C, Si, Mn } = heatData.chemSteel;
      if (C && Si && Mn && C > 0.12 && Si > 0.25 && Mn > 1.2) {
        return {
          id: 'chemistry-optimization',
          priority: 'important',
          title: 'Chemistry Optimization',
          message: 'Minor adjustments could improve final grade',
          confidence: 78,
          actionable: true,
          actionLabel: 'Optimize Chemistry',
          actionType: 'optimize',
          context: 'Fine-tuning chemistry for optimal steel properties',
          source: 'physics'
        };
      }
    }

    return null;
  }

  /**
   * Process Status: Normal monitoring information
   */
  private static checkProcessStatus(heatData: HeatData, persona?: string): HeroInsight | null {
    // Check current stage from timeline
    if (heatData.stages && heatData.stages.length > 0) {
      const currentStage = heatData.stages.find(s => s.status === 'active') || 
                          heatData.stages[heatData.stages.length - 1];
      
      if (currentStage) {
        return {
          id: 'process-status',
          priority: 'normal',
          title: `${currentStage.name} Phase`,
          message: `Heat ${heatData.heat} progressing normally`,
          value: currentStage.progress || heatData.confidence,
          unit: '% complete',
          confidence: heatData.confidence || 85,
          actionable: false,
          context: `Currently in ${currentStage.name} phase of steel production`,
          source: 'system'
        };
      }
    }

    return null;
  }

  /**
   * Default Insight: When no specific conditions are met
   */
  private static createDefaultInsight(): HeroInsight {
    return {
      id: 'default-waiting',
      priority: 'normal',
      title: 'Awaiting Heat Data',
      message: 'Select a heat to begin monitoring',
      confidence: 0,
      actionable: true,
      actionLabel: 'Load Heat Data',
      actionType: 'monitor',
      context: 'No active heat selected for monitoring',
      source: 'system'
    };
  }

  /**
   * Status Insight: General operational status
   */
  private static createStatusInsight(heatData: HeatData, persona?: string): HeroInsight {
    return {
      id: 'status-normal',
      priority: 'normal', 
      title: `Heat ${heatData.heat} Running`,
      message: `${heatData.grade} steel production proceeding normally`,
      value: heatData.confidence,
      unit: '% confidence',
      confidence: heatData.confidence || 85,
      actionable: false,
      context: 'All systems operating within normal parameters',
      source: 'system'
    };
  }

  /**
   * LazyFlow Helper: Get the appropriate action button color
   */
  static getActionButtonVariant(insight: HeroInsight): 'destructive' | 'default' | 'secondary' {
    switch (insight.priority) {
      case 'critical':
        return 'destructive';
      case 'urgent':
      case 'important':
        return 'default';
      default:
        return 'secondary';
    }
  }

  /**
   * LazyFlow Helper: Get confidence ring color
   */
  static getConfidenceColor(confidence: number): string {
    if (confidence >= 90) return 'text-green-500';
    if (confidence >= 75) return 'text-yellow-500'; 
    return 'text-red-500';
  }

  /**
   * LazyFlow Helper: Format time remaining for display
   */
  static formatTimeRemaining(timeString?: string): string {
    if (!timeString) return '';
    return `⏱ ${timeString} to act`;
  }
}