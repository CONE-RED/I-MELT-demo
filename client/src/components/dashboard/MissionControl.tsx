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
import { autoStartService, AutoStartConfig } from '@/lib/AutoStartService';
import ResetControls from '@/components/demo/ResetControls';
import SyncGuardBanner from '@/components/industrial/SyncGuardBanner';
import PersonaSwitch, { usePersona, PersonaConditional, PERSONA_COPY, type PersonaType } from '@/components/ui/PersonaSwitch';

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
  const [isAutoStarting, setIsAutoStarting] = useState(false);
  
  // Phase 4: Persona management
  const { currentPersona, changePersona, personaConfig, shouldShow } = usePersona('operator');

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
      
      // Ensure simulation is running before triggering scenarios
      if (!autoStartService.isRunning()) {
        console.log('⚠️ No active simulation, starting one first...');
        await autoStartService.autoStart({ seed: 42, heatId: 93378 });
        // Give the simulation a moment to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
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
      } else {
        console.warn(`⚠️ Scenario failed:`, result.error);
        toast({
          title: "Scenario Issue",
          description: "Please wait for simulation to fully initialize.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error(`Failed to trigger scenario ${scenarioId}:`, error);
    }
  };

  const applyRecovery = async () => {
    try {
      console.log('🚀 Applying AI recovery actions...');
      
      // Ensure simulation is running before applying recovery
      if (!autoStartService.isRunning()) {
        console.log('⚠️ No active simulation, starting one first...');
        await autoStartService.autoStart({ seed: 42, heatId: 93378 });
        // Give the simulation a moment to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const response = await fetch('/api/demo/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error?.includes('No active simulation')) {
          toast({
            title: "Starting Simulation",
            description: "Please wait for simulation to initialize, then try recovery again.",
            variant: "default",
          });
        } else {
          throw new Error(errorData.error || 'Recovery failed');
        }
        return;
      }
      
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
      toast({
        title: "Recovery Failed",
        description: "Could not apply recovery actions. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Reset to baseline with deterministic seed
  const resetToBaseline = async () => {
    try {
      const status = await autoStartService.reset(42);
      toast({
        title: "Baseline Restored",
        description: `Reset complete with seed=${status.seed}`,
      });
      console.log('✅ G2 Reset Success:', status);
    } catch (error) {
      console.error('❌ G2 Reset Failed:', error);
      toast({
        title: "Reset Failed",
        description: "Could not reset to baseline",
        variant: "destructive",
      });
    }
  };

  // Phase 3: Trigger caster delay scenario for Sync Guard demonstration
  const triggerCasterDelay = async () => {
    try {
      console.log('🎬 Triggering caster delay scenario for Sync Guard demo');
      
      // For demo purposes, we'll just show a toast and trigger the sync guard banner visibility
      toast({
        title: "Caster Delay Detected",
        description: "LF2→CC1 route delayed by 4 minutes - Sync Guard activated",
        variant: "destructive",
      });
      
      // In a real implementation, this would trigger the actual caster delay scenario
      // For now, the SyncGuardBanner component already shows the delay scenario
      
      console.log('✓ Caster delay scenario activated - Sync Guard should now be visible');
    } catch (error) {
      console.error('Failed to trigger caster delay scenario:', error);
    }
  };

  // Configure hotkeys for demo win moments + G2 reset + Phase 3 caster delay
  useHotkeys({
    '1': () => triggerScenario('energy-spike'),
    '2': () => triggerScenario('foam-collapse'), 
    '3': () => triggerScenario('temp-risk'),
    '4': () => triggerCasterDelay(), // Phase 3: Trigger caster delay scenario
    'r': applyRecovery,
    'R': applyRecovery,
    '0': resetToBaseline, // G2 requirement: One-key reset
    '?': () => setShowCheatSheet(!showCheatSheet)
  });

  // Phase 1: Deterministic Auto-Start from URL Parameters (No clicks required)
  // TEMPORARILY DISABLED TO FIX INFINITE LOOP
  useEffect(() => {
    console.log('⚠️ AutoStart temporarily disabled to prevent infinite API calls');
    return; // EARLY RETURN TO DISABLE
    
    const initializeDeterministicStart = async () => {
      if (isAutoStarting) return; // Prevent multiple initializations
      
      setIsAutoStarting(true);
      console.log('🎯 Phase 1: Initializing deterministic auto-start...');
      
      try {
        // Parse URL parameters for deterministic demo
        const urlParams = new URLSearchParams(window.location.search);
        const seed = parseInt(urlParams.get('seed') || '42');
        const heatId = parseInt(urlParams.get('heatId') || '93378');
        const scenario = urlParams.get('scenario') || '';
        
        console.log(`🔄 Deterministic start: seed=${seed}, heatId=${heatId}, scenario=${scenario}`);
        
        // Use the new deterministic reset endpoint for consistent behavior
        const resetParams = new URLSearchParams({
          seed: seed.toString(),
          heatId: heatId.toString()
        });
        
        if (scenario) {
          resetParams.set('scenario', scenario);
          // Add injection timing based on scenario
          const injectAtSec = getScenarioInjectTime(scenario);
          if (injectAtSec) {
            resetParams.set('injectAtSec', injectAtSec.toString());
          }
        }
        
        const response = await fetch(`/api/demo/reset?${resetParams.toString()}`);
        const result = await response.json();
        
        if (result.ok) {
          console.log('✅ Deterministic auto-start successful:', result);
          
          toast({
            title: "Factory Demo Ready",
            description: scenario 
              ? `Heat ${result.heatId} with ${scenario} scenario loaded (seed=${result.seed})`
              : `Heat ${result.heatId} baseline loaded (seed=${result.seed})`,
            variant: "default",
          });
        } else {
          throw new Error(result.error || 'Deterministic start failed');
        }
        
      } catch (error) {
        console.error('❌ Deterministic auto-start failed:', error);
        
        toast({
          title: "Auto-Start Issue",
          description: "Falling back to manual controls",
          variant: "destructive",
        });
      } finally {
        setIsAutoStarting(false);
      }
    };

    initializeDeterministicStart();
  }, [toast]);

  // Helper function to get scenario injection times
  const getScenarioInjectTime = (scenarioId: string): number | null => {
    const scenarioTimes: { [key: string]: number } = {
      'energy-spike': 120,
      'foam-collapse': 180,
      'temp-risk': 240,
      'power-factor': 300
    };
    return scenarioTimes[scenarioId] || null;
  };

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
      
      {/* Phase 4: Persona Switch - Transform view for different stakeholders */}
      <PersonaSwitch 
        currentPersona={currentPersona}
        onPersonaChange={changePersona}
        compact={isMobile}
        className="mb-4"
      />
      
      {/* Phase 3: Sync Guard Banner - Shows ΔT decay and € impact */}
      <PersonaConditional persona={['manager', 'cfo']} currentPersona={currentPersona}>
        <SyncGuardBanner 
          heatId={heat?.heat || 93378}
          onMitigationChosen={(mitigation) => {
            toast({
              title: "Mitigation Applied",
              description: `${mitigation.name} - Monitoring for temperature improvements`,
              variant: "default",
            });
            console.log('🎯 Sync Guard mitigation chosen:', mitigation);
          }}
        />
      </PersonaConditional>
      
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
          {/* Primary action button (main hero insight action) */}
          {heroInsight.actionable && heroInsight.actionLabel && (
            <div className="mb-4">
              <Button 
                variant={HeroInsightCalculator.getActionButtonVariant(heroInsight)}
                size="lg"
                className="w-full"
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
            </div>
          )}
          
          {/* Secondary control buttons - separated for better layout */}
          <PersonaConditional exclude={['cfo']} currentPersona={currentPersona}>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Manual start button (requested by user) */}
              <Button 
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    setIsAutoStarting(true);
                    const status = await autoStartService.manualStart();
                    toast({
                      title: "Manual Start",
                      description: `Heat ${status.heatId} started manually`,
                    });
                  } catch (error) {
                    toast({
                      title: "Start Failed",
                      description: "Could not start simulation",
                      variant: "destructive",
                    });
                  } finally {
                    setIsAutoStarting(false);
                  }
                }}
                disabled={isAutoStarting}
                className="text-xs"
              >
                {isAutoStarting ? "Starting..." : "🚀 Manual Start"}
              </Button>
              
              {/* Reset button for G2 */}
              <Button 
                variant="secondary"
                size="sm"
                onClick={async () => {
                  try {
                    const status = await autoStartService.reset(42);
                    toast({
                      title: "Reset Complete",
                      description: `Baseline restored with seed=${status.seed}`,
                    });
                  } catch (error) {
                    toast({
                      title: "Reset Failed",
                      description: "Could not reset to baseline",
                      variant: "destructive",
                    });
                  }
                }}
                className="text-xs"
              >
                🔄 Reset & Seed
              </Button>
            </div>
          </PersonaConditional>
          
          {/* Phase 4: CFO-specific ROI PDF download */}
          <PersonaConditional persona={['manager', 'cfo']} currentPersona={currentPersona}>
            <div className="mb-4">
              <Button 
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/roi/pdf?heatId=${heat?.heat || 93378}`);
                    if (!response.ok) throw new Error('PDF generation failed');
                    
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `I-MELT-ROI-Report-Heat-${heat?.heat || 93378}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    
                    toast({
                      title: "ROI Report Generated",
                      description: "Professional PDF report downloaded successfully",
                    });
                  } catch (error) {
                    toast({
                      title: "PDF Generation Failed",
                      description: "Could not generate ROI report",
                      variant: "destructive",
                    });
                  }
                }}
                className="text-xs w-full"
              >
                📊 Download ROI PDF Report
              </Button>
            </div>
          </PersonaConditional>
          
          {/* Context explanation */}
          <p className="text-sm text-gray-600">
            💡 {heroInsight.context}
          </p>
        </CardContent>
      </Card>

      {/* Predictive Actions Section - Smart suggestions */}
      <PersonaConditional exclude={['cfo']} currentPersona={currentPersona}>
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
      </PersonaConditional>

      {/* Phase 1: Deterministic Reset Controls for Factory Demos */}
      <PersonaConditional exclude={['cfo']} currentPersona={currentPersona}>
        <ResetControls 
          className="mb-6"
          onReset={(params) => {
            console.log('🔄 Reset executed with params:', params);
            // The component handles URL updates and API calls
            // This callback can be used for additional state updates if needed
          }}
        />
      </PersonaConditional>

      {/* Ambient Details - Background context */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {currentPersona === 'cfo' ? 'Financial Overview' : 
           currentPersona === 'manager' ? 'KPI Dashboard' : 
           currentPersona === 'metallurgist' ? 'Process Parameters' : 
           'System Overview'}
        </h2>
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