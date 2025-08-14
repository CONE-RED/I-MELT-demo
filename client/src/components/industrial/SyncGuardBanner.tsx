/**
 * SyncGuardBanner.tsx
 * Phase 3: LF→CC Sync Guard with € mapping (CFO hook)
 * 
 * Shows ΔT decay to caster and converts to €/heat, €/day, €/year
 * Offers two mitigations with live € deltas
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, TrendingUp, Zap, Settings, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RouteETA {
  eta_LF: number;           // ETA from ladle furnace (minutes from now)
  eta_CC: number;           // ETA to continuous caster (minutes from now)
  eta_target: number;       // Target transfer time (minutes from now)
  route_id: string;         // Route identifier
}

interface TemperatureImpact {
  predicted_deltaT: number; // Predicted temperature loss (°C)
  cost_per_heat: number;    // Cost impact per heat (€)
  cost_per_day: number;     // Cost impact per day (€)
  cost_per_year: number;    // Cost impact per year (€)
}

interface MitigationOption {
  id: 'boost' | 'coordinate';
  name: string;
  description: string;
  energy_cost: number;      // Additional energy cost (€/heat)
  deltaT_reduction: number; // Temperature loss reduction (°C)
  time_impact: number;      // Time impact (minutes)
  net_cost: number;         // Net cost after mitigation (€/heat)
}

interface SyncAnalysis {
  route: RouteETA;
  baseline_impact: TemperatureImpact;
  mitigation_options: MitigationOption[];
  delay_minutes: number;
  requires_action: boolean;
}

interface SyncGuardBannerProps {
  heatId?: number;
  className?: string;
  onMitigationChosen?: (mitigation: MitigationOption) => void;
}

export default function SyncGuardBanner({ 
  heatId = 93378, 
  className,
  onMitigationChosen 
}: SyncGuardBannerProps) {
  const [syncAnalysis, setSyncAnalysis] = useState<SyncAnalysis | null>(null);
  const [selectedMitigation, setSelectedMitigation] = useState<MitigationOption | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Mock data for demo - in real implementation would come from API
  useEffect(() => {
    // Simulate a caster delay scenario for Phase 3 demo
    const mockRoute: RouteETA = {
      eta_LF: 2,    // Ladle ready in 2 minutes
      eta_CC: 8,    // Caster available in 8 minutes  
      eta_target: 4, // Target was 4 minutes
      route_id: "LF2→CC1"
    };

    const delay_minutes = Math.max(0, mockRoute.eta_CC - mockRoute.eta_target);
    
    // Calculate baseline impact (using same logic as server model)
    const predicted_deltaT = delay_minutes * 1.8; // 1.8°C per minute
    const cost_per_heat = (predicted_deltaT / 10) * 150; // €150 per 10°C
    const cost_per_day = cost_per_heat * 24; // 24 heats/day
    const cost_per_year = cost_per_day * 350; // 350 working days

    const baseline_impact: TemperatureImpact = {
      predicted_deltaT,
      cost_per_heat,
      cost_per_day,
      cost_per_year
    };

    // Generate mitigation options
    const mitigation_options: MitigationOption[] = [
      {
        id: 'boost',
        name: 'Boost superheat now',
        description: 'Add energy to maintain temperature during delay',
        energy_cost: 25,
        deltaT_reduction: Math.min(predicted_deltaT, delay_minutes * 1.2),
        time_impact: 2,
        net_cost: Math.max(0, 25 - (Math.min(predicted_deltaT, delay_minutes * 1.2) / 10) * 150)
      },
      {
        id: 'coordinate',
        name: 'Coordinate LF/CC',
        description: 'Reschedule caster to minimize delay',
        energy_cost: 0,
        deltaT_reduction: delay_minutes * 0.8 * 1.8,
        time_impact: -delay_minutes * 0.6,
        net_cost: Math.max(0, cost_per_heat - (delay_minutes * 0.8 * 1.8 / 10) * 150)
      }
    ];

    const analysis: SyncAnalysis = {
      route: mockRoute,
      baseline_impact,
      mitigation_options,
      delay_minutes,
      requires_action: delay_minutes > 3
    };

    setSyncAnalysis(analysis);
    
    // Show banner if action is required
    setIsVisible(analysis.requires_action);
  }, [heatId]);

  const handleMitigationSelect = (mitigation: MitigationOption) => {
    setSelectedMitigation(mitigation);
  };

  const handleApplyMitigation = async () => {
    if (!selectedMitigation || !syncAnalysis) return;

    setIsApplying(true);
    
    try {
      // Call API to apply mitigation (placeholder for now)
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      console.log(`🎯 Applied mitigation: ${selectedMitigation.name}`);
      
      if (onMitigationChosen) {
        onMitigationChosen(selectedMitigation);
      }
      
      // Hide banner after successful application
      setTimeout(() => setIsVisible(false), 2000);
      
    } catch (error) {
      console.error('Failed to apply mitigation:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatTime = (minutes: number): string => {
    const absMinutes = Math.abs(minutes);
    const sign = minutes < 0 ? '-' : '+';
    return `${sign}${Math.floor(absMinutes)}:${String(absMinutes % 60).padStart(2, '0')}`;
  };

  if (!syncAnalysis || !isVisible) {
    return null;
  }

  const { route, baseline_impact, mitigation_options, delay_minutes } = syncAnalysis;

  return (
    <Card className={cn(
      "border-l-4 border-l-orange-500 shadow-lg animate-in slide-in-from-top duration-500",
      "bg-gradient-to-r from-orange-50 via-white to-orange-50",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-full">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
                LF→CC Sync Guard
                <Badge variant="destructive" className="text-xs">
                  {delay_minutes}min delay
                </Badge>
              </CardTitle>
              <p className="text-sm text-orange-700 font-medium">
                Route: {route.route_id} • Caster delay will cause temperature loss
              </p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsVisible(false)}
            className="text-orange-600 hover:text-orange-800"
          >
            ×
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Status Row */}
        <div className="grid grid-cols-4 gap-4 p-3 bg-white rounded-lg border">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              ETA LF
            </div>
            <div className="text-lg font-bold text-green-700">
              {formatTime(route.eta_LF)}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              ETA CC
            </div>
            <div className="text-lg font-bold text-red-700">
              {formatTime(route.eta_CC)}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-gray-600">Predicted ΔT</div>
            <div className="text-lg font-bold text-red-700">
              -{baseline_impact.predicted_deltaT.toFixed(1)}°C
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-gray-600">Impact</div>
            <div className="text-lg font-bold text-red-700">
              {formatCurrency(baseline_impact.cost_per_heat)}
            </div>
          </div>
        </div>

        {/* Financial Impact Summary */}
        <div className="flex justify-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-red-600 font-medium">Per Heat</div>
                <div className="text-lg font-bold text-red-800">
                  {formatCurrency(baseline_impact.cost_per_heat)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-red-600 font-medium">Per Day</div>
                <div className="text-lg font-bold text-red-800">
                  {formatCurrency(baseline_impact.cost_per_day)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-red-600 font-medium">Per Year</div>
                <div className="text-lg font-bold text-red-800">
                  {formatCurrency(baseline_impact.cost_per_year)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mitigation Options */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800 text-sm">Available Mitigations:</h4>
          
          <div className="grid grid-cols-2 gap-3">
            {mitigation_options.map((mitigation) => {
              const isSelected = selectedMitigation?.id === mitigation.id;
              const finalCost = baseline_impact.cost_per_heat - 
                              (mitigation.deltaT_reduction / 10) * 150 + 
                              mitigation.energy_cost;
              const savings = baseline_impact.cost_per_heat - finalCost;
              
              return (
                <div
                  key={mitigation.id}
                  className={cn(
                    "border rounded-lg p-3 cursor-pointer transition-all",
                    isSelected 
                      ? "border-green-500 bg-green-50" 
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  )}
                  onClick={() => handleMitigationSelect(mitigation)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {mitigation.id === 'boost' ? (
                        <Zap className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Settings className="w-4 h-4 text-purple-600" />
                      )}
                      <span className="font-medium text-sm">{mitigation.name}</span>
                      {isSelected && <CheckCircle className="w-4 h-4 text-green-600" />}
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2">{mitigation.description}</p>
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ΔT Reduction:</span>
                      <span className="font-medium text-green-700">
                        +{mitigation.deltaT_reduction.toFixed(1)}°C
                      </span>
                    </div>
                    
                    {mitigation.energy_cost > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Energy Cost:</span>
                        <span className="font-medium text-red-700">
                          {formatCurrency(mitigation.energy_cost)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between pt-1 border-t">
                      <span className="text-gray-600">Net Savings:</span>
                      <span className={cn(
                        "font-bold",
                        savings > 0 ? "text-green-700" : "text-red-700"
                      )}>
                        {formatCurrency(savings)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time Impact:</span>
                      <span className={cn(
                        "font-medium",
                        mitigation.time_impact < 0 ? "text-green-700" : "text-orange-700"
                      )}>
                        {formatTime(mitigation.time_impact)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        {selectedMitigation && (
          <div className="flex justify-center pt-2">
            <Button
              onClick={handleApplyMitigation}
              disabled={isApplying}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium"
            >
              {isApplying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Applying {selectedMitigation.name}...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Apply {selectedMitigation.name}
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}