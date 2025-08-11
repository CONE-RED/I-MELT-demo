/**
 * MissionControl.tsx
 * LazyFlow Component: Transforms 8+ competing components into hero insight + predictive actions
 * 
 * Philosophy: Show users the ONE thing that matters most + 2-3 smart next actions
 */

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { HeroInsightCalculator, HeroInsight } from '@/lib/HeroInsightCalculator';
import { PredictiveActionEngine, PredictiveAction } from '@/lib/PredictiveActionEngine';
import { HeroConfidenceRing } from '@/components/ui/ConfidenceRingIndicator';
import AmbientDetailsGrid from './AmbientDetailsGrid';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import useMobile from '@/hooks/use-mobile';

// Keep essential demo hotkeys from original Dashboard
import { useHotkeys } from '@/hooks/useHotkeys';
import CheatSheetOverlay from '@/components/ui/cheat-sheet-overlay';
import AIChatWidget from '@/components/chat/AIChatWidget';

export default function MissionControl() {
  const heat = useSelector((state: RootState) => state.heat);
  const loading = useSelector((state: RootState) => state.loading);
  const isMobile = useMobile();
  const { toast } = useToast();
  
  const [heroInsight, setHeroInsight] = useState<HeroInsight | null>(null);
  const [predictiveActions, setPredictiveActions] = useState<PredictiveAction[]>([]);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [executingAction, setExecutingAction] = useState<string | null>(null);

  // LazyFlow: Calculate hero insight and actions when heat data changes
  useEffect(() => {
    if (heat) {
      const insight = HeroInsightCalculator.calculateHeroInsight(heat);
      const actions = PredictiveActionEngine.generateNextActions(heat);
      
      setHeroInsight(insight);
      setPredictiveActions(actions);
    }
  }, [heat]);

  // Demo scenario hotkey handlers (preserve from original Dashboard)
  const triggerScenario = async (scenarioId: string) => {
    try {
      console.log(`🎬 Triggering LazyFlow demo scenario: ${scenarioId}`);
      const response = await fetch(`/api/demo/scenario/${scenarioId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      if (result.ok) {
        toast({
          title: "Demo Scenario Active",
          description: `${result.scenario.name} - Watch the magic happen!`,
        });
        console.log(`✓ Scenario "${scenarioId}" activated:`, result.scenario.name);
      }
    } catch (error) {
      console.error(`Failed to trigger scenario ${scenarioId}:`, error);
    }
  };

  const applyRecovery = async () => {
    try {
      console.log('🚀 Applying AI recovery actions...');
      const response = await fetch('/api/demo/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      if (result.ok) {
        toast({
          title: "AI Recovery Applied",
          description: "Crisis resolved! All systems back to optimal.",
          variant: "default",
        });
        console.log('✓ Recovery applied successfully');
      }
    } catch (error) {
      console.error('Failed to apply recovery:', error);
    }
  };

  // Configure hotkeys for demo win moments
  useHotkeys({
    '1': () => triggerScenario('energy-spike'),
    '2': () => triggerScenario('foam-collapse'), 
    '3': () => triggerScenario('temp-risk'),
    'r': applyRecovery,
    'R': applyRecovery,
    '?': () => setShowCheatSheet(!showCheatSheet)
  });

  // Auto-start simulator for smooth demos
  useEffect(() => {
    (async () => {
      try {
        await fetch(`/api/demo/start?seed=42&heatId=93378`);
        console.log('✓ LazyFlow simulator auto-started for seamless demos');
      } catch (e) {
        console.error('✗ Failed to auto-start simulator:', e);
      }
    })();
  }, []);

  // Execute predictive action
  const executeAction = async (action: PredictiveAction) => {
    if (!action.oneClickAvailable) {
      toast({
        title: "Manual Action Required",
        description: action.description,
        variant: "default",
      });
      return;
    }

    setExecutingAction(action.id);
    
    try {
      const result = await PredictiveActionEngine.executeAction(action);
      
      if (result.success) {
        toast({
          title: "Action Completed",
          description: result.message,
          variant: "default",
        });
        
        // Refresh insights after action
        setTimeout(() => {
          if (heat) {
            const newInsight = HeroInsightCalculator.calculateHeroInsight(heat);
            const newActions = PredictiveActionEngine.generateNextActions(heat);
            setHeroInsight(newInsight);
            setPredictiveActions(newActions);
          }
        }, 1000);
      } else {
        toast({
          title: "Action Failed", 
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Action execution error:', error);
      toast({
        title: "Error",
        description: "Failed to execute action. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExecutingAction(null);
    }
  };

  if (loading) {
    return <MissionControlSkeleton />;
  }

  if (!heat || !heroInsight) {
    return <NoHeatState />;
  }

  return (
    <div className={cn(
      "space-y-6 p-6",
      isMobile && "p-4 space-y-4"
    )}>
      
      {/* Hero Insight Section - The ONE thing that matters */}
      <Card className="border-l-4 border-l-blue-500 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className={cn(
                "text-2xl font-bold",
                heroInsight.priority === 'critical' ? 'text-red-700' :
                heroInsight.priority === 'urgent' ? 'text-yellow-700' :
                heroInsight.priority === 'important' ? 'text-blue-700' : 'text-gray-700'
              )}>
                {heroInsight.title}
              </CardTitle>
              <CardDescription className="text-base mt-1">
                {heroInsight.message}
              </CardDescription>
            </div>
            
            {/* Hero confidence indicator */}
            <div className={cn("flex-shrink-0", isMobile && "hidden")}>
              <HeroConfidenceRing 
                confidence={heroInsight.confidence}
                title="AI Confidence"
                className="ml-6"
              />
            </div>
          </div>
          
          {/* Key metrics row */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
            {heroInsight.value && (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">
                  {heroInsight.value}
                </span>
                {heroInsight.unit && (
                  <span className="text-sm text-gray-600">{heroInsight.unit}</span>
                )}
                {heroInsight.trend && (
                  <span className={cn(
                    "text-lg",
                    heroInsight.trend === 'up' ? 'text-green-600' :
                    heroInsight.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  )}>
                    {heroInsight.trend === 'up' ? '↗' : 
                     heroInsight.trend === 'down' ? '↘' : '→'}
                  </span>
                )}
              </div>
            )}
            
            {heroInsight.timeRemaining && (
              <Badge variant="outline" className="text-sm">
                ⏱ {heroInsight.timeRemaining} to act
              </Badge>
            )}
            
            <Badge 
              variant={heroInsight.priority === 'critical' ? 'destructive' : 'secondary'}
              className="text-sm"
            >
              {heroInsight.priority.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {/* One-click action button for hero insight */}
          {heroInsight.actionable && heroInsight.actionLabel && (
            <Button 
              variant={HeroInsightCalculator.getActionButtonVariant(heroInsight)}
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => {
                if (heroInsight.actionType === 'fix') {
                  applyRecovery();
                } else {
                  toast({
                    title: heroInsight.actionLabel,
                    description: "Action initiated - monitoring progress",
                  });
                }
              }}
            >
              {heroInsight.actionLabel}
            </Button>
          )}
          
          {/* Context explanation */}
          <p className="text-sm text-gray-600 mt-3">
            💡 {heroInsight.context}
          </p>
        </CardContent>
      </Card>

      {/* Predictive Actions Section - Smart suggestions */}
      <div className="grid gap-4 md:grid-cols-3">
        {predictiveActions.map((action, index) => (
          <Card key={action.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{action.icon}</span>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                </div>
                <Badge 
                  className={cn(
                    "text-xs",
                    PredictiveActionEngine.getPriorityBadgeColor(action.priority)
                  )}
                >
                  {action.priority}
                </Badge>
              </div>
              <CardDescription>{action.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>⏱ {action.estimatedTime}</span>
                <span>📈 {action.expectedBenefit}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {action.confidence}% confidence
                </span>
                
                {action.oneClickAvailable ? (
                  <Button
                    variant={PredictiveActionEngine.getActionButtonVariant(action)}
                    size="sm"
                    onClick={() => executeAction(action)}
                    disabled={executingAction === action.id}
                  >
                    {executingAction === action.id ? 'Executing...' : 'Execute'}
                  </Button>
                ) : (
                  <Button variant="outline" size="sm">
                    Manual
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ambient Details - Background context */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h2>
        <AmbientDetailsGrid heatData={heat} />
      </div>

      {/* Floating AI Chat Widget */}
      <AIChatWidget heatData={heat} />

      {/* Demo Control Overlay */}
      <CheatSheetOverlay 
        isVisible={showCheatSheet}
        onClose={() => setShowCheatSheet(false)}
      />
    </div>
  );
}

/**
 * Loading skeleton while data loads
 */
function MissionControlSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="w-24 h-24 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </CardHeader>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-3">
        {[1,2,3].map(i => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * No heat selected state
 */
function NoHeatState() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
      <div className="text-6xl mb-4">🔥</div>
      <h2 className="text-2xl font-semibold mb-2">Ready for Steel Mastery</h2>
      <p className="text-center max-w-md mb-6">
        Select a heat from the dropdown above to begin AI-powered steel production optimization.
      </p>
      <Button variant="outline">
        Load Demo Heat Data
      </Button>
    </div>
  );
}