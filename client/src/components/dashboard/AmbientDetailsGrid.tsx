/**
 * AmbientDetailsGrid.tsx
 * LazyFlow Component: Background context that doesn't compete for attention
 * 
 * Philosophy: Important info should be visible but not distracting from hero insights
 */

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { HeatData } from '@/lib/HeroInsightCalculator';
import ConfidenceRingIndicator from '@/components/ui/ConfidenceRingIndicator';

interface AmbientDetailsGridProps {
  heatData: HeatData;
  className?: string;
  persona?: 'operator' | 'metallurgist' | 'manager' | 'cfo';
  onShowControls?: () => void;
  onShowAlerts?: () => void;
  onShowGraphs?: () => void;
  onShowChemistry?: () => void;
  onShowReports?: () => void;
}

interface AmbientMetric {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'danger';
  icon?: string;
  expectedImpact?: {
    delta: number;
    description: string;
    confidence: number;
  };
}

export default function AmbientDetailsGrid({ 
  heatData, 
  className, 
  persona = 'operator',
  onShowControls,
  onShowAlerts,
  onShowGraphs,
  onShowChemistry,
  onShowReports
}: AmbientDetailsGridProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Auto-refresh every 5 seconds for live data
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const metrics = generateAmbientMetrics(heatData, persona);
  const keyChemistry = getKeyChemistry(heatData);
  const processStatus = getProcessStatus(heatData);

  return (
    <div className={cn("space-y-4", className)}>
      
      {/* Key Metrics Row - Persona-specific layout */}
      <div className={cn(
        "gap-3",
        persona === 'cfo' ? 'grid grid-cols-2' : 'grid grid-cols-4'
      )}>
        {getPersonaMetrics(metrics, persona).map((metric) => (
          <MetricCard key={metric.id} metric={metric} persona={persona} />
        ))}
      </div>

      {/* Chemistry Overview - Hidden for CFO */}
      {persona !== 'cfo' && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            {getPersonaTitle('chemistry', persona)}
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {keyChemistry.map((element) => (
              <ChemistryElement key={element.symbol} element={element} />
            ))}
          </div>
        </div>
      )}

      {/* Process Timeline Mini - Different focus per persona */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          {getPersonaTitle('process', persona)}
        </h3>
        <ProcessMiniTimeline status={processStatus} persona={persona} />
      </div>

      {/* Financial Summary for CFO */}
      {persona === 'cfo' && (
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h3 className="text-sm font-medium text-green-800 mb-3">Financial Impact</h3>
          <FinancialSummary heatData={heatData} />
        </div>
      )}

      {/* Quick Actions - Persona-specific */}
      <div className="grid grid-cols-3 gap-2">
        {getPersonaActions(persona, {
          onShowControls,
          onShowAlerts,
          onShowGraphs,
          onShowChemistry,
          onShowReports
        }).map((action) => (
          <QuickActionButton 
            key={action.label}
            icon={action.icon} 
            label={action.label} 
            onClick={action.onClick} 
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual Metric Card - Small and unobtrusive with Phase 2 ghost values + Live animations
 */
function MetricCard({ metric, persona }: { metric: AmbientMetric, persona?: string }) {
  const statusColors = {
    good: 'text-green-600 bg-green-50',
    warning: 'text-yellow-600 bg-yellow-50', 
    danger: 'text-red-600 bg-red-50'
  };

  const trendIcon = {
    up: '↗',
    down: '↘',
    stable: '→'
  };

  const isChanging = metric.trend !== 'stable';

  return (
    <div className={cn(
      "bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-all duration-300",
      isChanging && "shadow-sm ring-1 ring-blue-100"
    )}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">{metric.label}</span>
        {metric.trend && (
          <span className={cn(
            "text-xs transition-all duration-300",
            metric.status === 'good' ? 'text-green-600' : 
            metric.status === 'warning' ? 'text-yellow-600' : 'text-red-600',
            isChanging && "animate-bounce"
          )}>
            {trendIcon[metric.trend]}
          </span>
        )}
      </div>
      
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-1">
          <span className={cn(
            "text-lg font-semibold transition-all duration-500",
            statusColors[metric.status].split(' ')[0],
            isChanging && "animate-pulse"
          )}>
            {metric.value}
          </span>
          {metric.unit && (
            <span className="text-xs text-gray-500">{metric.unit}</span>
          )}
          {isChanging && (
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse ml-1"></div>
          )}
        </div>
        
        {/* Phase 2: Expected Impact Ghost Values */}
        {metric.expectedImpact && (
          <div className="text-xs text-right">
            <div className={cn(
              "font-medium transition-all duration-300",
              metric.expectedImpact.delta > 0 ? 'text-green-600' : 
              metric.expectedImpact.delta < 0 ? 'text-red-600' : 'text-gray-400'
            )}>
              {metric.expectedImpact.delta > 0 ? '+' : ''}{metric.expectedImpact.delta}{metric.unit}
            </div>
            <div className="text-gray-400 text-[10px]">
              {metric.expectedImpact.confidence}% conf
            </div>
          </div>
        )}
      </div>
      
      {/* Phase 2: Expected Impact Description on Hover */}
      {metric.expectedImpact && (
        <div className="mt-1 text-[10px] text-gray-500 opacity-0 hover:opacity-100 transition-opacity">
          {metric.expectedImpact.description}
        </div>
      )}

      {/* Live indicator for changing values */}
      {isChanging && (
        <div className="mt-1 flex items-center gap-1">
          <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-green-400 rounded-full animate-pulse"></div>
          <span className="text-[10px] text-gray-500">Live</span>
        </div>
      )}
    </div>
  );
}

/**
 * Chemistry Element - Compact chemistry display
 */
function ChemistryElement({ element }: { element: { symbol: string; value: number; status: string } }) {
  return (
    <div className="text-center">
      <div className={cn(
        "text-xs font-medium",
        element.status === 'good' ? 'text-green-700' :
        element.status === 'warning' ? 'text-yellow-700' : 'text-red-700'
      )}>
        {element.symbol}
      </div>
      <div className="text-xs text-gray-600">
        {(element.value * 100).toFixed(2)}%
      </div>
    </div>
  );
}

/**
 * Mini Process Timeline - Dynamic progress view with live updates
 */
function ProcessMiniTimeline({ status, persona }: { status: any, persona?: string }) {
  const stages = ['Charge', 'Melt', 'Refine', 'Tap'];
  const currentStage = status.currentStageIndex || 1;
  const stageProgress = status.stageProgress || 0;

  return (
    <div className="space-y-3">
      {/* Stage Progress Bar */}
      <div className="flex items-center gap-2">
        {stages.map((stage, index) => (
          <div key={stage} className="flex items-center">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-500",
              index < currentStage 
                ? "bg-green-100 text-green-700" // Completed stages
                : index === currentStage
                ? "bg-blue-100 text-blue-700 ring-2 ring-blue-200 animate-pulse" // Current stage
                : "bg-gray-100 text-gray-400" // Future stages
            )}>
              {index < currentStage ? '✓' : index + 1}
            </div>
            {index < stages.length - 1 && (
              <div className={cn(
                "w-6 h-1 ml-2 rounded-full transition-all duration-500",
                index < currentStage ? "bg-green-200" : 
                index === currentStage ? "bg-blue-200" : "bg-gray-200"
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Current Stage Details */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">
            {stages[currentStage]} Phase
          </span>
          {status.isAccelerated && (
            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-medium">
              ⚡ Optimized
            </span>
          )}
        </div>
        <div className="text-gray-500">
          {stageProgress}% • ETC {status.estimatedCompletion}
        </div>
      </div>

      {/* Stage Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div 
          className={cn(
            "h-1.5 rounded-full transition-all duration-1000 ease-out",
            currentStage === 0 ? "bg-orange-400" :
            currentStage === 1 ? "bg-blue-400" :
            currentStage === 2 ? "bg-purple-400" : "bg-green-400"
          )}
          style={{ width: `${stageProgress}%` }}
        />
      </div>

      {/* Process Stats */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <div className="text-gray-500">Elapsed</div>
          <div className="font-medium">{status.elapsedMinutes}min</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500">Total Est.</div>
          <div className="font-medium">{status.totalEstimatedMinutes}min</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500">Efficiency</div>
          <div className={cn(
            "font-medium",
            status.progress > 90 ? "text-green-600" :
            status.progress > 80 ? "text-yellow-600" : "text-red-600"
          )}>
            {status.progress}%
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Quick Action Button - Minimal touch targets
 */
function QuickActionButton({ 
  icon, 
  label, 
  onClick 
}: { 
  icon: string; 
  label: string; 
  onClick: () => void; 
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
    >
      <span className="text-lg">{icon}</span>
      <span className="text-xs text-gray-600">{label}</span>
    </button>
  );
}

/**
 * Generate ambient metrics from heat data - Now truly dynamic based on seed and actions
 */
function generateAmbientMetrics(heatData: HeatData, persona: string): AmbientMetric[] {
  const metrics: AmbientMetric[] = [];
  
  // Calculate dynamic values based on heat data, seed, and executed actions
  const dynamicValues = calculateDynamicValues(heatData);

  // Temperature metric with seed-based variation and action impacts
  metrics.push({
    id: 'temperature',
    label: 'Temperature',
    value: dynamicValues.temperature,
    unit: '°C',
    trend: dynamicValues.temperatureTrend,
    status: dynamicValues.temperatureStatus,
    icon: '🌡️',
    expectedImpact: {
      delta: dynamicValues.temperatureDelta,
      description: dynamicValues.temperatureDescription,
      confidence: dynamicValues.temperatureConfidence
    }
  });

  // Power level dynamically calculated from chemistry and actions
  metrics.push({
    id: 'power',
    label: 'Power',
    value: dynamicValues.power,
    unit: '%',
    trend: dynamicValues.powerTrend,
    status: dynamicValues.powerStatus,
    expectedImpact: {
      delta: dynamicValues.powerDelta,
      description: dynamicValues.powerDescription,
      confidence: dynamicValues.powerConfidence
    }
  });

  // Energy efficiency affected by chemistry balance and foam conditions
  metrics.push({
    id: 'efficiency',
    label: 'Efficiency',
    value: dynamicValues.efficiency,
    unit: '%',
    trend: dynamicValues.efficiencyTrend,
    status: dynamicValues.efficiencyStatus,
    expectedImpact: {
      delta: dynamicValues.efficiencyDelta,
      description: dynamicValues.efficiencyDescription,
      confidence: dynamicValues.efficiencyConfidence
    }
  });

  // Process time based on stage and actions
  const processTime = calculateProcessTime(heatData, dynamicValues);
  metrics.push({
    id: 'time',
    label: 'Time',
    value: processTime.value,
    unit: processTime.unit,
    trend: processTime.trend,
    status: processTime.status
  });

  return metrics;
}

/**
 * Calculate dynamic values based on heat data, seed, and executed actions
 */
function calculateDynamicValues(heatData: HeatData) {
  const seed = heatData._simulationSeed || 42;
  const lastAction = heatData._lastActionExecuted;
  const chemistry = heatData.chemSteel;
  
  // Base values with seed variation
  const seedVariation = (seed % 100) / 100; // 0-1
  
  // Temperature calculation based on chemistry and process state
  let baseTemp = 1575 + (seedVariation * 15); // 1575-1590°C base
  let temperatureTrend: 'up' | 'down' | 'stable' = 'stable';
  let temperatureStatus: 'good' | 'warning' | 'danger' = 'good';
  let temperatureDelta = -15;
  let temperatureDescription = "Optimal superheat reduces caster risk";
  let temperatureConfidence = 96;
  
  // Chemistry impacts on temperature
  if (chemistry?.C) {
    if (chemistry.C < 0.10) {
      baseTemp += 8; // Low carbon requires higher temperature
      temperatureDelta = -20;
      temperatureDescription = "Carbon addition will reduce required temperature";
    }
    if (chemistry.C > 0.15) {
      baseTemp -= 5; // High carbon enables lower temperature
    }
  }
  
  if (chemistry?.S && chemistry.S > 0.025) {
    baseTemp += 12; // High sulfur needs higher temperature for treatment
    temperatureDelta = -25;
    temperatureDescription = "Desulfurization will enable temperature reduction";
  }
  
  // Action impacts on temperature
  if (lastAction?.actionId === 'adjust-carbon-content') {
    baseTemp -= 8; // Carbon addition reduces required temperature
    temperatureTrend = 'down';
    temperatureDescription = "Carbon addition successful - temperature optimized";
    temperatureConfidence = 98;
  }
  
  if (lastAction?.actionId === 'reduce-sulfur-content') {
    baseTemp -= 15; // Desulfurization allows lower temperature
    temperatureTrend = 'down';
    temperatureDescription = "Desulfurization enables lower superheat";
    temperatureConfidence = 94;
  }
  
  // Temperature status
  if (baseTemp > 1585) temperatureStatus = 'warning';
  if (baseTemp > 1595) temperatureStatus = 'danger';
  
  // Power calculation based on chemistry efficiency and arc stability
  let basePower = 88 + (seedVariation * 16); // 88-104% base
  let powerTrend: 'up' | 'down' | 'stable' = 'stable';
  let powerStatus: 'good' | 'warning' | 'danger' = 'good';
  let powerDelta = -2.1;
  let powerDescription = "Arc stabilization reduces power losses";
  let powerConfidence = 87;
  
  // Chemistry impacts on power efficiency
  if (chemistry?.Si && chemistry.Si < 0.15) {
    basePower += 4; // Poor deoxidation increases power needs
    powerDelta = -4.2;
    powerDescription = "Silicon addition will improve arc efficiency";
  }
  
  if (chemistry?.C && chemistry.C < 0.10) {
    basePower += 6; // Low carbon increases melting power requirements
    powerDelta = -3.8;
    powerDescription = "Carbon addition will reduce power consumption";
  }
  
  // Action impacts on power
  if (lastAction?.actionId === 'adjust-carbon-content') {
    basePower -= 3; // Carbon addition improves efficiency
    powerTrend = 'down';
    powerDescription = "Carbon optimization improving power efficiency";
    powerConfidence = 92;
  }
  
  if (lastAction?.actionId === 'adjust-silicon-content') {
    basePower -= 4; // Silicon improves arc stability
    powerTrend = 'down';
    powerDescription = "Silicon addition stabilizing arc - power reducing";
    powerConfidence = 89;
  }
  
  // Power status
  if (basePower > 100) powerStatus = 'warning';
  if (basePower > 110) powerStatus = 'danger';
  
  // Efficiency calculation based on overall process optimization
  let baseEfficiency = 91 + (seedVariation * 8); // 91-99% base
  let efficiencyTrend: 'up' | 'down' | 'stable' = 'stable';
  let efficiencyStatus: 'good' | 'warning' | 'danger' = 'good';
  let efficiencyDelta = 2.5;
  let efficiencyDescription = "Foam stabilization improves arc efficiency";
  let efficiencyConfidence = 84;
  
  // Chemistry balance impacts efficiency
  if (chemistry) {
    const chemBalance = getChemistryBalance(chemistry);
    baseEfficiency += chemBalance.efficiencyBonus;
    if (chemBalance.efficiencyBonus > 0) {
      efficiencyTrend = 'up';
      efficiencyDescription = "Good chemistry balance improving efficiency";
      efficiencyConfidence = 90;
    }
  }
  
  // Action impacts on efficiency
  if (lastAction) {
    baseEfficiency += 3; // Any optimization action improves efficiency
    efficiencyTrend = 'up';
    efficiencyDescription = "Process optimization increasing efficiency";
    efficiencyConfidence = 93;
  }
  
  // Efficiency status
  if (baseEfficiency < 90) efficiencyStatus = 'warning';
  if (baseEfficiency < 85) efficiencyStatus = 'danger';
  
  return {
    temperature: Math.round(baseTemp),
    temperatureTrend,
    temperatureStatus,
    temperatureDelta,
    temperatureDescription,
    temperatureConfidence,
    power: Math.round(basePower),
    powerTrend,
    powerStatus,
    powerDelta,
    powerDescription,
    powerConfidence,
    efficiency: Math.round(baseEfficiency),
    efficiencyTrend,
    efficiencyStatus,
    efficiencyDelta,
    efficiencyDescription,
    efficiencyConfidence
  };
}

/**
 * Analyze chemistry balance and its impact on process efficiency
 */
function getChemistryBalance(chemistry: any) {
  let efficiencyBonus = 0;
  let balanceScore = 0;
  
  // Carbon balance check
  if (chemistry.C >= 0.10 && chemistry.C <= 0.15) {
    balanceScore += 2;
    efficiencyBonus += 1;
  }
  
  // Silicon balance check  
  if (chemistry.Si >= 0.15 && chemistry.Si <= 0.35) {
    balanceScore += 2;
    efficiencyBonus += 1.5;
  }
  
  // Sulfur control check
  if (chemistry.S <= 0.025) {
    balanceScore += 1;
    efficiencyBonus += 0.5;
  }
  
  // Phosphorus control check
  if (chemistry.P <= 0.025) {
    balanceScore += 1;
    efficiencyBonus += 0.5;
  }
  
  return { balanceScore, efficiencyBonus };
}

/**
 * Extract key chemistry elements for display
 */
function getKeyChemistry(heatData: HeatData) {
  if (!heatData.chemSteel) {
    return [
      { symbol: 'C', value: 0.12, status: 'good' },
      { symbol: 'Si', value: 0.25, status: 'good' },
      { symbol: 'Mn', value: 1.35, status: 'good' },
      { symbol: 'P', value: 0.018, status: 'good' },
      { symbol: 'S', value: 0.022, status: 'warning' }
    ];
  }

  const { C, Si, Mn, P, S } = heatData.chemSteel;
  
  return [
    { symbol: 'C', value: C || 0.12, status: getChemistryStatus('C', C || 0.12) },
    { symbol: 'Si', value: Si || 0.25, status: getChemistryStatus('Si', Si || 0.25) },
    { symbol: 'Mn', value: Mn || 1.35, status: getChemistryStatus('Mn', Mn || 1.35) },
    { symbol: 'P', value: P || 0.018, status: getChemistryStatus('P', P || 0.018) },
    { symbol: 'S', value: S || 0.022, status: getChemistryStatus('S', S || 0.022) }
  ];
}

/**
 * Get chemistry element status based on typical ranges
 */
function getChemistryStatus(element: string, value: number): string {
  const ranges = {
    C: { min: 0.10, max: 0.15 },
    Si: { min: 0.15, max: 0.35 },
    Mn: { min: 1.20, max: 1.60 },
    P: { max: 0.025 },
    S: { max: 0.025 }
  };

  const range = ranges[element as keyof typeof ranges];
  if (!range) return 'good';

  if (element === 'P' || element === 'S') {
    return value <= range.max ? 'good' : 'warning';
  }

  if ('min' in range && value < range.min) return 'warning';
  if (value > range.max) return 'warning';
  return 'good';
}

/**
 * Get current process status with dynamic progression
 */
function getProcessStatus(heatData: HeatData) {
  const seed = heatData._simulationSeed || 42;
  const lastAction = heatData._lastActionExecuted;
  const startTime = heatData.ts ? new Date(heatData.ts).getTime() : Date.now() - (45 * 60 * 1000);
  const currentTime = Date.now();
  const elapsedMinutes = Math.floor((currentTime - startTime) / (1000 * 60));
  
  // Calculate stage progression based on elapsed time and process efficiency
  let stageIndex = 1; // Default to Melting
  let stageName = 'Melt';
  let stageProgress = 0;
  
  // Base stage timing with seed variation
  const stageTimings = {
    charge: 5 + ((seed % 7) * 1), // 5-12 minutes  
    melt: 35 + ((seed % 15) * 2), // 35-65 minutes
    refine: 25 + ((seed % 12) * 1.5), // 25-43 minutes
    tap: 8 + ((seed % 5) * 1) // 8-13 minutes
  };
  
  // Adjust timings based on chemistry and actions
  if (heatData.chemSteel) {
    const { C, S, Si } = heatData.chemSteel;
    if (C && C < 0.10) stageTimings.melt += 8; // Low carbon extends melt
    if (S && S > 0.025) stageTimings.refine += 15; // High sulfur extends refining
    if (Si && Si < 0.15) stageTimings.refine += 8; // Poor deoxidation
  }
  
  // Actions accelerate process
  if (lastAction) {
    Object.keys(stageTimings).forEach(key => {
      stageTimings[key as keyof typeof stageTimings] *= 0.9; // 10% faster
    });
  }
  
  // Determine current stage based on elapsed time
  let cumulativeTime = 0;
  const stages = ['Charge', 'Melt', 'Refine', 'Tap'];
  const timings = [stageTimings.charge, stageTimings.melt, stageTimings.refine, stageTimings.tap];
  
  for (let i = 0; i < stages.length; i++) {
    if (elapsedMinutes <= cumulativeTime + timings[i]) {
      stageIndex = i;
      stageName = stages[i];
      stageProgress = Math.min(100, ((elapsedMinutes - cumulativeTime) / timings[i]) * 100);
      break;
    }
    cumulativeTime += timings[i];
  }
  
  // If we've completed all stages, stay at Tap with 100% progress
  if (elapsedMinutes > cumulativeTime) {
    stageIndex = 3;
    stageName = 'Tap';
    stageProgress = 100;
  }
  
  // Calculate estimated completion
  const totalTime = Object.values(stageTimings).reduce((sum, time) => sum + time, 0);
  const remainingMinutes = Math.max(0, totalTime - elapsedMinutes);
  const estimatedCompletion = new Date(currentTime + remainingMinutes * 60 * 1000);
  const timeString = estimatedCompletion.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return {
    currentStageIndex: stageIndex,
    currentStage: stageName,
    stageProgress: Math.round(stageProgress),
    progress: heatData.confidence || 85,
    estimatedCompletion: timeString,
    elapsedMinutes,
    totalEstimatedMinutes: Math.round(totalTime),
    isAccelerated: !!lastAction
  };
}

/**
 * Calculate process time information with dynamic progression
 */
function calculateProcessTime(heatData: HeatData, dynamicValues?: any) {
  const seed = heatData._simulationSeed || 42;
  const lastAction = heatData._lastActionExecuted;
  
  // Base time with seed variation
  let elapsed = 42 + ((seed % 23) * 2); // 42-88 minutes with seed variation
  let trend: 'up' | 'down' | 'stable' = 'stable';
  
  // Chemistry impacts on processing time
  if (heatData.chemSteel) {
    const { C, S, Si } = heatData.chemSteel;
    
    // Poor chemistry slows down process
    if (C && C < 0.10) elapsed += 8; // Low carbon extends melt time
    if (S && S > 0.025) elapsed += 12; // High sulfur needs extra treatment
    if (Si && Si < 0.15) elapsed += 6; // Poor deoxidation extends refining
  }
  
  // Action impacts on time
  if (lastAction) {
    elapsed -= 5; // Process optimization reduces time
    trend = 'down';
  }
  
  // Efficiency impacts time
  if (dynamicValues?.efficiency > 95) {
    elapsed -= 3; // High efficiency saves time
    trend = 'down';
  } else if (dynamicValues?.efficiency < 90) {
    elapsed += 5; // Low efficiency extends process
  }
  
  if (elapsed < 60) {
    return { value: elapsed, unit: 'min', status: 'good' as const, trend };
  } else if (elapsed < 90) {
    return { value: Math.round(elapsed / 60 * 10) / 10, unit: 'hrs', status: 'warning' as const, trend };
  } else {
    return { value: Math.round(elapsed / 60 * 10) / 10, unit: 'hrs', status: 'danger' as const, trend };
  }
}

/**
 * Get persona-specific metrics (filtering and prioritization)
 */
function getPersonaMetrics(metrics: AmbientMetric[], persona: string): AmbientMetric[] {
  switch (persona) {
    case 'cfo':
      // CFO sees cost-focused metrics with financial impact
      return metrics
        .filter(m => ['efficiency', 'time'].includes(m.id))
        .map(metric => ({
          ...metric,
          // Transform labels for CFO perspective
          label: metric.id === 'efficiency' ? 'Cost Efficiency' : 'Process Cost',
          value: metric.id === 'efficiency' ? '€8.2K' : '€450',
          unit: metric.id === 'efficiency' ? '/month' : '/heat'
        }));
        
    case 'manager':
      // Manager sees KPI-focused metrics
      return metrics.slice(0, 4).map(metric => ({
        ...metric,
        label: metric.id === 'temperature' ? 'Quality KPI' : 
               metric.id === 'power' ? 'Energy KPI' : metric.label,
      }));
      
    case 'metallurgist':
      // Metallurgist sees technical process metrics
      return metrics.map(metric => ({
        ...metric,
        label: metric.id === 'temperature' ? 'Steel Temp' : 
               metric.id === 'power' ? 'Arc Power' : metric.label,
      }));
      
    default: // operator
      return metrics.slice(0, 4);
  }
}

/**
 * Get persona-specific section titles
 */
function getPersonaTitle(section: string, persona: string): string {
  const titles = {
    operator: {
      chemistry: 'Steel Chemistry',
      process: 'Process Status'
    },
    metallurgist: {
      chemistry: 'Chemical Analysis',
      process: 'Metallurgical Process'
    },
    manager: {
      chemistry: 'Quality Metrics',
      process: 'Production KPIs'
    },
    cfo: {
      chemistry: 'Quality Control',
      process: 'Financial Timeline'
    }
  };
  
  return titles[persona as keyof typeof titles]?.[section as keyof typeof titles.operator] || titles.operator[section as keyof typeof titles.operator];
}

/**
 * Get persona-specific quick actions with working functionality
 */
function getPersonaActions(persona: string, callbacks: {
  onShowControls?: () => void;
  onShowAlerts?: () => void;
  onShowGraphs?: () => void;
  onShowChemistry?: () => void;
  onShowReports?: () => void;
}) {
  const { onShowControls, onShowAlerts, onShowGraphs, onShowChemistry, onShowReports } = callbacks;
  
  const actions = {
    operator: [
      { 
        icon: '🔧', 
        label: 'Controls', 
        onClick: onShowControls || (() => console.log('Controls callback not provided'))
      },
      { 
        icon: '⚠️', 
        label: 'Alerts', 
        onClick: onShowAlerts || (() => console.log('Alerts callback not provided'))
      },
      { 
        icon: '📊', 
        label: 'Graphs', 
        onClick: onShowGraphs || (() => console.log('Graphs callback not provided'))
      }
    ],
    metallurgist: [
      { 
        icon: '🧪', 
        label: 'Chemistry', 
        onClick: onShowChemistry || (() => console.log('Chemistry callback not provided'))
      },
      { 
        icon: '🌡️', 
        label: 'Temp', 
        onClick: onShowControls || (() => console.log('Temperature control'))
      },
      { 
        icon: '⚖️', 
        label: 'Balance', 
        onClick: onShowGraphs || (() => console.log('Material balance'))
      }
    ],
    manager: [
      { 
        icon: '📈', 
        label: 'KPIs', 
        onClick: onShowGraphs || (() => console.log('KPI dashboard'))
      },
      { 
        icon: '👥', 
        label: 'Team', 
        onClick: onShowAlerts || (() => console.log('Team status'))
      },
      { 
        icon: '📋', 
        label: 'Reports', 
        onClick: onShowReports || (() => console.log('Shift reports'))
      }
    ],
    cfo: [
      { 
        icon: '💰', 
        label: 'Costs', 
        onClick: onShowReports || (() => console.log('Cost analysis'))
      },
      { 
        icon: '📊', 
        label: 'ROI', 
        onClick: onShowReports || (() => console.log('ROI reports'))
      },
      { 
        icon: '📈', 
        label: 'Trends', 
        onClick: onShowGraphs || (() => console.log('Financial trends'))
      }
    ]
  };
  
  return actions[persona as keyof typeof actions] || actions.operator;
}

/**
 * Financial Summary Component for CFO
 */
function FinancialSummary({ heatData }: { heatData: HeatData }) {
  const savings = {
    energy: 850, // € per heat
    electrode: 320,
    time: 180,
    quality: 240
  };
  
  const total = Object.values(savings).reduce((sum, val) => sum + val, 0);
  
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-700">Energy Savings:</span>
          <span className="font-semibold text-green-600">€{savings.energy}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">Electrode Savings:</span>
          <span className="font-semibold text-green-600">€{savings.electrode}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">Time Savings:</span>
          <span className="font-semibold text-green-600">€{savings.time}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">Quality Improvement:</span>
          <span className="font-semibold text-green-600">€{savings.quality}</span>
        </div>
      </div>
      
      <div className="border-t border-green-200 pt-2">
        <div className="flex justify-between text-base font-semibold">
          <span className="text-gray-800">Total Impact:</span>
          <span className="text-green-700">€{total}/heat</span>
        </div>
        <div className="text-xs text-gray-600 text-right">
          ≈€{Math.round(total * 6.5)}/day • €{Math.round(total * 6.5 * 30)}/month
        </div>
      </div>
    </div>
  );
}