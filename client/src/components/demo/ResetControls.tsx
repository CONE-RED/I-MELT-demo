/**
 * ResetControls.tsx
 * Phase 1: Deterministic Reset & Seed Component for Factory Demos
 * 
 * Provides one-click replay functionality for EAF operators to see identical scenarios
 */

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCcw, Play, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResetControlsProps {
  className?: string;
  onReset?: (params: ResetParams) => void;
}

interface ResetParams {
  seed: number;
  heatId: number;
  scenario: string;
  injectAtSec?: number;
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  injectAtSec: number;
  expectedImpact: string;
  category: string;
}

export default function ResetControls({ className = "", onReset }: ResetControlsProps) {
  const dispatch = useDispatch();
  const [seed, setSeed] = useState('42');
  const [heatId, setHeatId] = useState('93378');
  const [selectedScenario, setSelectedScenario] = useState('none');
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isResetting, setIsResetting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastResetSuccess, setLastResetSuccess] = useState<{seed: number, heatId: number, scenario: string} | null>(null);
  const { toast } = useToast();

  // Load available scenarios
  const loadScenarios = async () => {
    try {
      const response = await fetch('/api/demo/scenarios');
      const data = await response.json();
      if (data.ok) {
        setScenarios(data.scenarios);
      }
    } catch (error) {
      console.error('Failed to load scenarios:', error);
    }
  };

  // Initialize scenarios on mount
  React.useEffect(() => {
    loadScenarios();
  }, []);

  // Deterministic reset with scenario
  const executeReset = async (withScenario: boolean = false) => {
    setIsResetting(true);
    setIsLoading(true);

    try {
      const seedNum = parseInt(seed) || 42;
      const heatIdNum = parseInt(heatId) || 93378;
      const scenario = withScenario && selectedScenario !== 'none' ? selectedScenario : '';

      console.log(`🔄 Executing deterministic reset: seed=${seedNum}, scenario=${scenario}`);

      // Build reset URL with parameters
      const params = new URLSearchParams({
        seed: seedNum.toString(),
        heatId: heatIdNum.toString()
      });

      if (scenario) {
        params.set('scenario', scenario);
        // Add injection time if scenario is selected
        const scenarioData = scenarios.find(s => s.id === scenario);
        if (scenarioData) {
          params.set('injectAtSec', scenarioData.injectAtSec.toString());
        }
      }

      const response = await fetch(`/api/demo/reset?${params.toString()}`);
      const result = await response.json();

      if (result.ok) {
        // Update URL parameters for deep-linking
        const newParams = new URLSearchParams(window.location.search);
        newParams.set('seed', seedNum.toString());
        newParams.set('heatId', heatIdNum.toString());
        
        if (scenario) {
          newParams.set('scenario', scenario);
        } else {
          newParams.delete('scenario');
        }

        // Update URL without page reload
        const newUrl = `${window.location.pathname}?${newParams.toString()}`;
        window.history.replaceState(null, '', newUrl);

        // Update Redux store with new dynamic heat data
        try {
          // Get base heat structure from static API
          const baseResponse = await fetch(`/api/heat/${heatIdNum}`);
          if (!baseResponse.ok) throw new Error('Failed to fetch base heat data');
          const baseHeatData = await baseResponse.json();
          
          // Merge simulation result data into heat structure for realistic dynamic behavior
          const updatedHeatData = {
            ...baseHeatData,
            confidence: result.confidence || baseHeatData.confidence,
            // Update insights with seed-specific variations
            insights: baseHeatData.insights.map((insight: any, idx: number) => ({
              ...insight,
              // Add seed-based variation to insight messages  
              message: seedNum && seedNum !== 42 ? 
                insight.message.replace(/0\.\d+/g, (match: string) => {
                  const val = parseFloat(match);
                  const variation = ((seedNum % 100) / 100 - 0.5) * 0.1; // ±5% variation
                  return (val + variation).toFixed(3);
                }) : insight.message,
              timestamp: new Date(Date.now() - (idx * 5 * 60000) - ((seedNum || 42) % 10) * 1000).toISOString()
            })),
            // Update chemistry with seed-based variations for visible differences
            chemSteel: Object.fromEntries(
              Object.entries(baseHeatData.chemSteel).map(([key, value]) => [
                key, 
                value !== null && seedNum ? 
                  Math.round((value + ((seedNum % 13) / 100 - 0.065) * value) * 1000) / 1000 :
                  value
              ])
            ),
            // Add simulation metadata
            _simulationSeed: seedNum,
            _scenarioApplied: scenario,
            _lastUpdate: new Date().toISOString()
          };
          
          dispatch({ 
            type: 'SET_HEAT_DATA', 
            payload: updatedHeatData 
          });
          
          console.log(`✅ Heat data updated with seed ${seedNum} from ResetControls:`, {
            seed: updatedHeatData._simulationSeed,
            scenario: updatedHeatData._scenarioApplied,
            confidence: updatedHeatData.confidence
          });

          // Set visual feedback for successful reset
          setLastResetSuccess({
            seed: seedNum,
            heatId: heatIdNum,
            scenario: scenario
          });

          // Clear success indicator after 5 seconds
          setTimeout(() => {
            setLastResetSuccess(null);
          }, 5000);
        } catch (error) {
          console.error('❌ Failed to update heat data in Redux:', error);
        }

        toast({
          title: "Deterministic Reset Complete",
          description: scenario 
            ? `Heat ${heatIdNum} reset with ${scenario} scenario (seed=${seedNum})`
            : `Heat ${heatIdNum} reset to baseline (seed=${seedNum})`,
          variant: "default",
        });

        // Callback for parent component
        if (onReset) {
          onReset({
            seed: seedNum,
            heatId: heatIdNum,
            scenario: scenario,
            injectAtSec: scenario ? scenarios.find(s => s.id === scenario)?.injectAtSec : undefined
          });
        }

        console.log('✅ Deterministic reset successful:', result);

      } else {
        throw new Error(result.error || 'Reset failed');
      }

    } catch (error: any) {
      console.error('❌ Reset failed:', error);
      toast({
        title: "Reset Failed",
        description: error.message || "Could not reset simulation",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
      setIsLoading(false);
    }
  };

  // Hotkey handler for "0" key
  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === '0' && !event.ctrlKey && !event.altKey && !event.metaKey) {
        // Don't trigger if user is typing in an input field
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return;
        }

        event.preventDefault();
        console.log('🔥 Hotkey "0" pressed - executing deterministic reset');
        executeReset(selectedScenario !== 'none');
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [selectedScenario, seed, heatId]);

  const selectedScenarioData = selectedScenario !== 'none' ? scenarios.find(s => s.id === selectedScenario) : null;

  return (
    <Card className={`${className} border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <RotateCcw className="w-5 h-5 text-orange-600" />
          <span className="font-bold text-gray-900">Reset & Seed Control</span>
          <span className="text-sm font-normal text-gray-600 ml-2">
            (Hotkey: <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">0</kbd>)
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Seed and Heat Configuration */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-semibold text-gray-700">Seed</label>
            <Input
              type="number"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="42"
              className="font-mono"
              disabled={isResetting}
            />
            <p className="text-xs text-gray-600 mt-1">Deterministic behavior</p>
          </div>
          
          <div>
            <label className="text-sm font-semibold text-gray-700">Heat ID</label>
            <Input
              type="number"
              value={heatId}
              onChange={(e) => setHeatId(e.target.value)}
              placeholder="93378"
              className="font-mono"
              disabled={isResetting}
            />
            <p className="text-xs text-gray-600 mt-1">Steel heat number</p>
          </div>
        </div>

        {/* Scenario Selection */}
        <div>
          <label className="text-sm font-semibold text-gray-700">Demo Scenario (Optional)</label>
          <Select value={selectedScenario} onValueChange={setSelectedScenario} disabled={isResetting}>
            <SelectTrigger>
              <SelectValue placeholder="Select scenario to replay..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No scenario (baseline only)</SelectItem>
              {scenarios.map((scenario) => (
                <SelectItem key={scenario.id} value={scenario.id}>
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-orange-500" />
                    <span>{scenario.name}</span>
                    <span className="text-xs text-gray-500">({scenario.expectedImpact})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedScenarioData && (
            <div className="mt-2 p-2 bg-orange-100 rounded text-xs">
              <p className="font-semibold text-gray-800">{selectedScenarioData.description}</p>
              <p className="text-gray-600">
                Inject at: {selectedScenarioData.injectAtSec}s • Impact: {selectedScenarioData.expectedImpact}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => executeReset(false)}
            disabled={isResetting}
            variant="outline"
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {isResetting ? "Resetting..." : "Reset Baseline"}
          </Button>
          
          <Button
            onClick={() => executeReset(true)}
            disabled={isResetting || selectedScenario === 'none'}
            className="flex-1 bg-orange-600 hover:bg-orange-700"
          >
            <Play className="w-4 h-4 mr-2" />
            {isResetting ? "Starting..." : "Reset with Scenario"}
          </Button>
        </div>

        {/* Day 3: Success feedback for parameter changes */}
        {lastResetSuccess && (
          <div className="mt-4 p-2 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-800">
                Reset Successful - Dashboard Updated
              </span>
            </div>
            <div className="text-xs text-green-600 mt-1">
              Seed: {lastResetSuccess.seed} • Heat: {lastResetSuccess.heatId}
              {lastResetSuccess.scenario && ` • Scenario: ${lastResetSuccess.scenario}`}
            </div>
          </div>
        )}

        <p className="text-xs text-gray-600 text-center">
          💡 Both actions update the URL for deep-linking and ensure identical replay
        </p>
      </CardContent>
    </Card>
  );
}