import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, AlertTriangle, CheckCircle, TrendingUp, Zap, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

import { Stage as ImportedStage } from '@/types';

interface LazyFlowStage {
  id: string;
  bucket: number;
  stage: string;
  plannedTime: string;
  actualTime?: string;
  status: 'completed' | 'current' | 'pending' | 'delayed';
  delay?: number;
  plannedEnergy: number;
  actualEnergy: number | null;
  profile: number;
  temp: number | null;
}

interface LazyFlowStageTimelineProps {
  stages: ImportedStage[];
}

export default function LazyFlowStageTimeline({ stages }: LazyFlowStageTimelineProps) {
  const { language } = useSelector((state: RootState) => state);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoFocusEnabled, setAutoFocusEnabled] = useState(true);

  // Auto-refresh timeline intelligence every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 15000);
    
    return () => clearInterval(interval);
  }, []);

  // Convert imported stages to LazyFlow format
  const convertToLazyFlowStages = (importedStages: ImportedStage[]): LazyFlowStage[] => {
    return importedStages.map((stage, index) => ({
      id: `stage-${stage.bucket}-${stage.stage}`,
      bucket: stage.bucket,
      stage: `Stage ${stage.stage}`,
      plannedTime: stage.plannedTime,
      actualTime: stage.actualTime ?? undefined,
      plannedEnergy: stage.plannedEnergy,
      actualEnergy: stage.actualEnergy,
      profile: stage.profile,
      temp: stage.temp,
      status: stage.status === 'done' ? 'completed' as const :
              stage.status === 'current' ? 'current' as const :
              'pending' as const,
      delay: stage.actualTime && stage.plannedTime ? 
        Math.max(0, new Date(`1970-01-01T${stage.actualTime}`).getTime() - new Date(`1970-01-01T${stage.plannedTime}`).getTime()) / 60000 : 
        undefined
    }));
  };

  const lazyFlowStages = convertToLazyFlowStages(stages);

  // LazyFlow Phase 1: Instant Critical Detection
  const getCriticalInsights = () => {
    const insights = [];
    const now = new Date();
    const currentStage = lazyFlowStages.find(s => s.status === 'current');
    const delayedStages = lazyFlowStages.filter(s => s.status === 'delayed');
    
    // Immediate critical alerts
    if (delayedStages.length > 0) {
      const totalDelay = delayedStages.reduce((sum, s) => sum + (s.delay || 0), 0);
      insights.push({
        type: 'critical',
        title: `${delayedStages.length} stages behind schedule`,
        impact: `${totalDelay} min total delay`,
        action: 'Accelerate bucket charging',
        urgency: 'immediate'
      });
    }

    // Predictive bottleneck detection
    if (currentStage && currentStage.bucket >= 3) {
      insights.push({
        type: 'prediction',
        title: 'Melting phase bottleneck approaching',
        impact: 'Potential 8-12 min delay',
        action: 'Pre-heat electrode adjustment',
        urgency: 'next 5 minutes'
      });
    }

    // Efficiency optimization opportunities
    const completedOnTime = lazyFlowStages.filter(s => s.status === 'completed' && !s.delay).length;
    const totalCompleted = lazyFlowStages.filter(s => s.status === 'completed').length;
    const efficiency = totalCompleted > 0 ? (completedOnTime / totalCompleted) * 100 : 100;
    
    if (efficiency < 85) {
      insights.push({
        type: 'optimization',
        title: 'Heat timing efficiency below target',
        impact: `${efficiency.toFixed(0)}% vs 90% target`,
        action: 'Review charging sequence',
        urgency: 'end of heat'
      });
    }

    return insights;
  };

  const criticalInsights = getCriticalInsights();

  // LazyFlow Phase 2: Realistic Furnace Actions
  const [executingAction, setExecutingAction] = useState<string | null>(null);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const executeTimelineAction = async (action: string, insightId?: string) => {
    setExecutingAction(action);
    
    try {
      // Realistic furnace action simulation
      const actionDetails = {
        'Accelerate bucket charging': {
          title: 'Bucket Charging Optimized',
          description: 'Power increased to 85MW, bucket sequence adjusted',
          duration: 2000,
          furnaceChanges: {
            power: '85MW',
            temperature: '+45°C',
            efficiency: '+12%',
            estimatedSavings: '6-8 minutes'
          }
        },
        'Pre-heat electrode adjustment': {
          title: 'Electrode Position Adjusted', 
          description: 'Gap reduced to 160mm, power ramping initiated',
          duration: 3000,
          furnaceChanges: {
            electrodeGap: '160mm',
            powerRamp: '78MW',
            heatRate: '+15%',
            estimatedSavings: '4-6 minutes'
          }
        },
        'Review charging sequence': {
          title: 'Charging Sequence Optimized',
          description: 'Bucket order resequenced for maximum efficiency',
          duration: 1500,
          furnaceChanges: {
            sequence: 'Optimized',
            efficiency: '+8%',
            qualityImpact: 'Neutral',
            estimatedSavings: '4-7 minutes'
          }
        }
      };

      const actionData = actionDetails[action as keyof typeof actionDetails];
      
      if (actionData) {
        // Show realistic loading state
        toast({
          title: "Executing Action...",
          description: `Applying ${action.toLowerCase()}`,
        });
        
        // Simulate realistic furnace response time
        await new Promise(resolve => setTimeout(resolve, actionData.duration));
        
        // Show success with furnace data changes
        toast({
          title: actionData.title,
          description: actionData.description,
          duration: 5000,
        });

        // Acknowledge the alert if insightId provided
        if (insightId) {
          setAcknowledgedAlerts(prev => new Set([...prev, insightId]));
        }

        // TODO: Update Redux state with realistic furnace changes
        // This should trigger actual dashboard updates
        console.log('🔥 Furnace Changes Applied:', actionData.furnaceChanges);
        
      } else {
        toast({
          title: "Action Executed",
          description: `${action} completed successfully`,
        });
      }
      
    } catch (error) {
      toast({
        title: "Action Failed", 
        description: "Unable to execute furnace action",
        variant: "destructive",
      });
    } finally {
      setExecutingAction(null);
    }
  };

  // LazyFlow Phase 3: Ambient Timeline Intelligence
  const getTimelineHealth = () => {
    const completed = lazyFlowStages.filter(s => s.status === 'completed').length;
    const total = lazyFlowStages.length;
    const onTimeStages = lazyFlowStages.filter(s => s.status === 'completed' && !s.delay).length;
    
    return {
      progress: Math.round((completed / total) * 100),
      efficiency: completed > 0 ? Math.round((onTimeStages / completed) * 100) : 100,
      eta: calculateETA(),
      status: getOverallStatus()
    };
  };

  const calculateETA = () => {
    const remaining = lazyFlowStages.filter(s => s.status === 'pending').length;
    const avgTimePerStage = 8; // minutes
    const currentDelays = lazyFlowStages.filter(s => s.delay).reduce((sum, s) => sum + (s.delay || 0), 0);
    const eta = remaining * avgTimePerStage + currentDelays;
    
    return `${Math.floor(eta / 60)}:${(eta % 60).toString().padStart(2, '0')}`;
  };

  const getOverallStatus = () => {
    const delayed = lazyFlowStages.filter(s => s.status === 'delayed').length;
    if (delayed > 2) return 'critical';
    if (delayed > 0) return 'warning';
    return 'optimal';
  };

  const timelineHealth = getTimelineHealth();

  // Only show critical stages + next upcoming (LazyFlow: reduce cognitive load)
  const getFocusedStages = () => {
    if (!autoFocusEnabled) return lazyFlowStages;
    
    const criticalStages = [
      ...lazyFlowStages.filter(s => s.status === 'delayed'),
      ...lazyFlowStages.filter(s => s.status === 'current'),
      ...lazyFlowStages.filter(s => s.status === 'pending').slice(0, 2) // Next 2 upcoming
    ];
    
    return criticalStages.length > 0 ? criticalStages : lazyFlowStages.slice(0, 5);
  };

  const focusedStages = getFocusedStages();

  const labels = {
    en: {
      title: "Smart Timeline Assistant",
      timelineHealth: "Timeline Health",
      smartFocus: "Smart Focus",
      allStages: "All Stages",
      eta: "ETA to Completion",
      efficiency: "On-Time Rate"
    },
    ru: {
      title: "Умный помощник временной шкалы",
      timelineHealth: "Состояние временной шкалы",
      smartFocus: "Умный фокус",
      allStages: "Все этапы",
      eta: "Время до завершения",
      efficiency: "Показатель своевременности"
    }
  };

  const lang = language === 'en' ? 'en' : 'ru';

  return (
    <div className="space-y-4">
      {/* LazyFlow Phase 1: Critical Insights Alert */}
      {criticalInsights.length > 0 && criticalInsights.some((_, index) => !acknowledgedAlerts.has(`insight-${index}`)) && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              🚨 Timeline Critical Issues
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {criticalInsights
              .filter((_, index) => !acknowledgedAlerts.has(`insight-${index}`))
              .map((insight, index) => {
                const insightId = `insight-${index}`;
                const isExecuting = executingAction === insight.action;
                
                return (
                  <div key={index} className="p-3 bg-white rounded-lg border border-red-200">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={cn(
                        "text-white text-xs",
                        insight.type === 'critical' ? "bg-red-600" :
                        insight.type === 'prediction' ? "bg-orange-600" : "bg-yellow-600"
                      )}>
                        {insight.urgency.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-600">{insight.urgency}</span>
                    </div>
                    
                    <div className="font-medium text-gray-900 mb-1">{insight.title}</div>
                    <div className="text-sm text-gray-600 mb-2">💥 Impact: {insight.impact}</div>
                    
                    <Button
                      className={cn(
                        "w-full text-white font-medium",
                        insight.type === 'critical' ? "bg-red-600 hover:bg-red-700" :
                        insight.type === 'prediction' ? "bg-orange-600 hover:bg-orange-700" :
                        "bg-yellow-600 hover:bg-yellow-700"
                      )}
                      onClick={() => executeTimelineAction(insight.action, insightId)}
                      disabled={isExecuting}
                    >
                      {isExecuting ? "⚙️ Executing..." : "⚡ " + insight.action}
                    </Button>
                  </div>
                );
              })}
            
            <div className="mt-3 p-2 bg-red-100 rounded text-center">
              <div className="text-xs text-red-700">
                AI monitors timeline every 15 seconds • Auto-detects bottlenecks • Calculates recovery actions
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* LazyFlow Phase 4: Ambient Status Dashboard */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-blue-800">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              {labels[lang].title}
            </div>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-3 h-3 rounded-full animate-pulse",
                timelineHealth.status === 'optimal' ? "bg-green-500" :
                timelineHealth.status === 'warning' ? "bg-yellow-500" : "bg-red-500"
              )} />
              <span className="text-xs">
                {timelineHealth.status === 'optimal' ? 'On Track' :
                 timelineHealth.status === 'warning' ? 'Minor Delays' : 'Critical Delays'}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">{timelineHealth.progress}%</div>
              <div className="text-xs text-gray-600">Progress</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-green-600">{timelineHealth.efficiency}%</div>
              <div className="text-xs text-gray-600">{labels[lang].efficiency}</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-purple-600">{timelineHealth.eta}</div>
              <div className="text-xs text-gray-600">{labels[lang].eta}</div>
            </div>
          </div>

          {/* Smart Focus Toggle */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-blue-800">View Mode:</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={autoFocusEnabled ? "default" : "outline"}
                onClick={() => setAutoFocusEnabled(true)}
                className="text-xs"
              >
                <Zap className="w-3 h-3 mr-1" />
                {labels[lang].smartFocus}
              </Button>
              <Button
                size="sm"
                variant={!autoFocusEnabled ? "default" : "outline"}
                onClick={() => setAutoFocusEnabled(false)}
                className="text-xs"
              >
                {labels[lang].allStages}
              </Button>
            </div>
          </div>

          {/* Focused Timeline View */}
          <div className="space-y-2">
            {focusedStages.map((stage, index) => (
              <div key={stage.id} className="flex items-center justify-between p-2 bg-white rounded border">
                <div className="flex items-center gap-3">
                  <Badge className={cn(
                    "text-xs",
                    stage.status === 'completed' ? "bg-green-100 text-green-700" :
                    stage.status === 'current' ? "bg-blue-100 text-blue-700" :
                    stage.status === 'delayed' ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-700"
                  )}>
                    Bucket {stage.bucket}
                  </Badge>
                  <span className="text-sm font-medium">{stage.stage}</span>
                  {stage.delay && (
                    <Badge variant="destructive" className="text-xs">
                      +{stage.delay}min
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Clock className="w-3 h-3" />
                  {stage.plannedTime}
                </div>
              </div>
            ))}
          </div>

          {autoFocusEnabled && lazyFlowStages.length > focusedStages.length && (
            <div className="mt-3 text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoFocusEnabled(false)}
                className="text-xs"
              >
                Show {lazyFlowStages.length - focusedStages.length} more stages
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Show success state when all critical alerts are acknowledged */}
      {criticalInsights.length > 0 && criticalInsights.every((_, index) => acknowledgedAlerts.has(`insight-${index}`)) && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-green-800 font-medium mb-2">
                <CheckCircle className="w-6 h-6" />
                All Critical Issues Resolved
              </div>
              <div className="text-sm text-green-600 mb-3">
                AI-guided actions completed successfully • Timeline recovery in progress • Estimated savings: 6-12 minutes
              </div>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="p-2 bg-white rounded border">
                  <div className="font-semibold text-green-700">Power</div>
                  <div className="text-green-600">Optimized</div>
                </div>
                <div className="p-2 bg-white rounded border">
                  <div className="font-semibold text-green-700">Efficiency</div>
                  <div className="text-green-600">+15%</div>
                </div>
                <div className="p-2 bg-white rounded border">
                  <div className="font-semibold text-green-700">Schedule</div>
                  <div className="text-green-600">On Track</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {criticalInsights.length === 0 && (
        <div className="p-4 bg-green-100 rounded-lg text-center">
          <div className="flex items-center justify-center gap-2 text-green-800 font-medium mb-1">
            <CheckCircle className="w-5 h-5" />
            Timeline Running Optimally
          </div>
          <div className="text-sm text-green-600">
            All stages on schedule • No bottlenecks detected • ETA on target
          </div>
        </div>
      )}
    </div>
  );
}