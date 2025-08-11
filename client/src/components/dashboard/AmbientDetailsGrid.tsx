/**
 * AmbientDetailsGrid.tsx
 * LazyFlow Component: Background context that doesn't compete for attention
 * 
 * Philosophy: Important info should be visible but not distracting from hero insights
 */

import { cn } from '@/lib/utils';
import { HeatData } from '@/lib/HeroInsightCalculator';
import ConfidenceRingIndicator from '@/components/ui/ConfidenceRingIndicator';

interface AmbientDetailsGridProps {
  heatData: HeatData;
  className?: string;
}

interface AmbientMetric {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'danger';
  icon?: string;
}

export default function AmbientDetailsGrid({ heatData, className }: AmbientDetailsGridProps) {
  
  const metrics = generateAmbientMetrics(heatData);
  const keyChemistry = getKeyChemistry(heatData);
  const processStatus = getProcessStatus(heatData);

  return (
    <div className={cn("space-y-4", className)}>
      
      {/* Key Metrics Row */}
      <div className="grid grid-cols-4 gap-3">
        {metrics.slice(0, 4).map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* Chemistry Overview */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Steel Chemistry</h3>
        <div className="grid grid-cols-5 gap-2">
          {keyChemistry.map((element) => (
            <ChemistryElement key={element.symbol} element={element} />
          ))}
        </div>
      </div>

      {/* Process Timeline Mini */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Process Status</h3>
        <ProcessMiniTimeline status={processStatus} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-2">
        <QuickActionButton 
          icon="📊" 
          label="Reports" 
          onClick={() => console.log('Quick reports')} 
        />
        <QuickActionButton 
          icon="⚙️" 
          label="Settings" 
          onClick={() => console.log('Settings')} 
        />
        <QuickActionButton 
          icon="🔄" 
          label="Refresh" 
          onClick={() => window.location.reload()} 
        />
      </div>
    </div>
  );
}

/**
 * Individual Metric Card - Small and unobtrusive
 */
function MetricCard({ metric }: { metric: AmbientMetric }) {
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">{metric.label}</span>
        {metric.trend && (
          <span className={cn(
            "text-xs",
            metric.status === 'good' ? 'text-green-600' : 
            metric.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
          )}>
            {trendIcon[metric.trend]}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={cn(
          "text-lg font-semibold",
          statusColors[metric.status].split(' ')[0]
        )}>
          {metric.value}
        </span>
        {metric.unit && (
          <span className="text-xs text-gray-500">{metric.unit}</span>
        )}
      </div>
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
 * Mini Process Timeline - Simplified progress view
 */
function ProcessMiniTimeline({ status }: { status: any }) {
  const stages = ['Charge', 'Melt', 'Refine', 'Tap'];
  const currentStage = status.currentStageIndex || 1;

  return (
    <div className="flex items-center gap-2">
      {stages.map((stage, index) => (
        <div key={stage} className="flex items-center">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
            index <= currentStage 
              ? "bg-blue-100 text-blue-700" 
              : "bg-gray-100 text-gray-400"
          )}>
            {index + 1}
          </div>
          {index < stages.length - 1 && (
            <div className={cn(
              "w-6 h-0.5 ml-2",
              index < currentStage ? "bg-blue-200" : "bg-gray-200"
            )} />
          )}
        </div>
      ))}
      <div className="ml-2 text-xs text-gray-600">
        {stages[currentStage]} Phase
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
 * Generate ambient metrics from heat data
 */
function generateAmbientMetrics(heatData: HeatData): AmbientMetric[] {
  const metrics: AmbientMetric[] = [];

  // Temperature metric
  metrics.push({
    id: 'temperature',
    label: 'Temperature',
    value: 1580,
    unit: '°C',
    trend: 'stable',
    status: 'good',
    icon: '🌡️'
  });

  // Power level
  metrics.push({
    id: 'power',
    label: 'Power',
    value: heatData.confidence || 85,
    unit: '%',
    trend: 'stable',
    status: (heatData.confidence || 85) > 80 ? 'good' : 'warning'
  });

  // Energy efficiency
  metrics.push({
    id: 'efficiency',
    label: 'Efficiency',
    value: 94,
    unit: '%',
    trend: 'up',
    status: 'good'
  });

  // Process time
  const processTime = calculateProcessTime(heatData);
  metrics.push({
    id: 'time',
    label: 'Time',
    value: processTime.value,
    unit: processTime.unit,
    trend: 'stable',
    status: processTime.status
  });

  return metrics;
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

  if (range.min && value < range.min) return 'warning';
  if (value > range.max) return 'warning';
  return 'good';
}

/**
 * Get current process status
 */
function getProcessStatus(heatData: HeatData) {
  // Simple mock process status
  return {
    currentStageIndex: 1, // Melting stage
    currentStage: 'Melting',
    progress: heatData.confidence || 85,
    estimatedCompletion: '23:45'
  };
}

/**
 * Calculate process time information
 */
function calculateProcessTime(heatData: HeatData) {
  // Mock calculation - in real app would use actual timestamps
  const elapsed = 45; // minutes
  
  if (elapsed < 60) {
    return { value: elapsed, unit: 'min', status: 'good' as const };
  } else if (elapsed < 90) {
    return { value: Math.round(elapsed / 60 * 10) / 10, unit: 'hrs', status: 'warning' as const };
  } else {
    return { value: Math.round(elapsed / 60 * 10) / 10, unit: 'hrs', status: 'danger' as const };
  }
}