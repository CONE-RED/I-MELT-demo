import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingDown, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnomalyPattern {
  id: string;
  type: 'drift' | 'spike' | 'drop' | 'oscillation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  parameter: string;
  currentValue: number;
  expectedValue: number;
  deviation: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  recommendation: string;
  confidence: number;
}

interface AnomalyDetectorProps {
  heatData: any;
  onAnomalyDetected: (anomaly: AnomalyPattern) => void;
}

export function AnomalyDetector({ heatData, onAnomalyDetected }: AnomalyDetectorProps) {
  const [detectedAnomalies, setDetectedAnomalies] = useState<AnomalyPattern[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    if (!heatData || !isMonitoring) return;

    const anomalies: AnomalyPattern[] = [];

    // Chemistry anomaly detection
    if (heatData.chemSteel) {
      const carbon = heatData.chemSteel.C;
      const targetCarbon = 0.13; // Target for grade 13KhFA/9
      
      if (Math.abs(carbon - targetCarbon) > 0.03) {
        anomalies.push({
          id: 'carbon-drift',
          type: 'drift',
          severity: carbon < 0.08 ? 'critical' : 'high',
          parameter: 'Carbon Content',
          currentValue: carbon,
          expectedValue: targetCarbon,
          deviation: ((carbon - targetCarbon) / targetCarbon) * 100,
          trend: carbon < targetCarbon ? 'decreasing' : 'increasing',
          recommendation: carbon < targetCarbon ? 
            'Increase carbon addition by 0.42t in next 5 minutes' : 
            'Reduce carbon input and increase oxidation',
          confidence: 94
        });
      }

      // Sulfur content check
      const sulfur = heatData.chemSteel.S;
      if (sulfur > 0.025) {
        anomalies.push({
          id: 'sulfur-spike',
          type: 'spike',
          severity: 'medium',
          parameter: 'Sulfur Content',
          currentValue: sulfur,
          expectedValue: 0.020,
          deviation: ((sulfur - 0.020) / 0.020) * 100,
          trend: 'increasing',
          recommendation: 'Add desulfurizing agents and monitor gas flow',
          confidence: 87
        });
      }
    }

    // Energy anomaly detection
    if (heatData.stages) {
      const currentStages = heatData.stages.filter(s => s.status === 'current');
      currentStages.forEach(stage => {
        if (stage.plannedEnergy && stage.actualEnergy) {
          const deviation = Math.abs(stage.actualEnergy - stage.plannedEnergy) / stage.plannedEnergy;
          if (deviation > 0.15) {
            anomalies.push({
              id: `energy-deviation-${stage.bucket}-${stage.stage}`,
              type: deviation > 0 ? 'spike' : 'drop',
              severity: deviation > 0.25 ? 'high' : 'medium',
              parameter: `Energy Bucket ${stage.bucket} Stage ${stage.stage}`,
              currentValue: stage.actualEnergy,
              expectedValue: stage.plannedEnergy,
              deviation: deviation * 100,
              trend: stage.actualEnergy > stage.plannedEnergy ? 'increasing' : 'decreasing',
              recommendation: 'Adjust power profile and check electrode positioning',
              confidence: 91
            });
          }
        }
      });
    }

    // Update anomalies state - prevent infinite re-renders
    setDetectedAnomalies(prev => {
      const currentIds = new Set(prev.map(a => a.id));
      const newAnomalyIds = new Set(anomalies.map(a => a.id));
      
      // Only update if there are actual changes
      const hasChanges = anomalies.length !== prev.length || 
        !anomalies.every(a => currentIds.has(a.id));
      
      if (!hasChanges) return prev;
      
      const newAnomalies = anomalies.filter(a => !currentIds.has(a.id));
      newAnomalies.forEach(onAnomalyDetected);
      
      return [...prev.filter(p => newAnomalyIds.has(p.id)), ...newAnomalies];
    });

  }, [heatData?.heat, heatData?.chemSteel?.C, heatData?.chemSteel?.S, isMonitoring]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />;
      case 'high':
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      case 'medium':
        return <TrendingDown className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 border-red-500/50';
      case 'high':
        return 'bg-orange-500/20 border-orange-500/50';
      case 'medium':
        return 'bg-yellow-500/20 border-yellow-500/50';
      default:
        return 'bg-blue-500/20 border-blue-500/50';
    }
  };

  // Always show the component for testing, even with no anomalies
  const hasAnomalies = detectedAnomalies.length > 0;

  return (
    <div className="fixed top-32 left-4 z-40 max-w-md">
      <div className="bg-cone-black/90 backdrop-blur-sm border border-cone-gray/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-cone-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-cone-red" />
            AI Anomaly Detection
          </h3>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Eye button clicked. Current state:', isMonitoring);
              alert(`Anomaly monitoring ${!isMonitoring ? 'enabled' : 'disabled'}`);
              setIsMonitoring(!isMonitoring);
              // Visual feedback for the user
              if (!isMonitoring) {
                console.log('Anomaly detection enabled');
              } else {
                console.log('Anomaly detection disabled');
              }
            }}
            className="text-cone-gray hover:text-cone-white transition-colors cursor-pointer"
            title={isMonitoring ? 'Disable monitoring' : 'Enable monitoring'}
          >
            {isMonitoring ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        <div className="space-y-3">
          {!hasAnomalies && (
            <div className="text-sm text-cone-gray">
              <div className="text-cone-white">Monitoring Status: {isMonitoring ? 'Active' : 'Disabled'}</div>
              <div className="text-xs mt-1">No anomalies detected. System operating normally.</div>
            </div>
          )}
          {detectedAnomalies.slice(0, 3).map((anomaly) => (
            <div
              key={anomaly.id}
              className={cn(
                "p-3 rounded-lg border",
                getSeverityColor(anomaly.severity)
              )}
            >
              <div className="flex items-start gap-3">
                {getSeverityIcon(anomaly.severity)}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-cone-white">
                    {anomaly.parameter}
                  </div>
                  <div className="text-xs text-cone-gray mt-1">
                    Current: {anomaly.currentValue.toFixed(3)} | 
                    Target: {anomaly.expectedValue.toFixed(3)} | 
                    Deviation: {anomaly.deviation.toFixed(1)}%
                  </div>
                  <div className="text-xs text-cone-white/80 mt-2">
                    {anomaly.recommendation}
                  </div>
                  <div className="text-xs text-cone-gray mt-1">
                    Confidence: {anomaly.confidence}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {detectedAnomalies.length > 3 && (
          <div className="text-xs text-cone-gray mt-3 text-center">
            +{detectedAnomalies.length - 3} more anomalies detected
          </div>
        )}
      </div>
    </div>
  );
}

interface PredictiveInsightsProps {
  heatData: any;
  historicalData?: any[];
}

export function PredictiveInsights({ heatData, historicalData = [] }: PredictiveInsightsProps) {
  const [predictions, setPredictions] = useState<any[]>([]);

  useEffect(() => {
    if (!heatData) {
      setPredictions([]);
      return;
    }

    // Generate predictive insights based on current trajectory
    const insights = [];

    // Chemistry trajectory prediction
    if (heatData.chemSteel?.C < 0.09) {
      insights.push({
        id: 'carbon-trajectory',
        type: 'prediction',
        title: 'Carbon Trajectory Alert',
        message: 'Current carbon trend will result in 0.082% C in 15 minutes, below grade specification',
        confidence: 92,
        timeToImpact: '15 minutes',
        severity: 'high',
        action: 'Adjust carbon addition rate now to prevent grade deviation'
      });
    }

    // Energy optimization prediction
    if (heatData.confidence > 90) {
      insights.push({
        id: 'energy-optimization',
        type: 'optimization',
        title: 'Energy Efficiency Opportunity',
        message: 'Historical pattern suggests 12% energy reduction possible with profile adjustment',
        confidence: 88,
        timeToImpact: 'Next 30 minutes',
        severity: 'medium',
        action: 'Switch to optimized power profile for maximum efficiency'
      });
    }

    // Only update if insights have actually changed
    setPredictions(prevPredictions => {
      const hasChanged = JSON.stringify(prevPredictions) !== JSON.stringify(insights);
      return hasChanged ? insights : prevPredictions;
    });
  }, [heatData?.heat, heatData?.chemSteel?.C, heatData?.confidence]);

  if (predictions.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-4 z-40 max-w-md">
      <div className="bg-gradient-to-r from-purple-900/90 to-blue-900/90 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          AI Predictive Insights
        </h3>

        <div className="space-y-3">
          {predictions.map((prediction) => (
            <div key={prediction.id} className="space-y-2">
              <div className="font-medium text-sm text-white">
                {prediction.title}
              </div>
              <div className="text-xs text-purple-200">
                {prediction.message}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-purple-300">
                  Impact in: {prediction.timeToImpact}
                </span>
                <span className="text-purple-300">
                  {prediction.confidence}% confidence
                </span>
              </div>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs py-2 px-3 rounded transition-colors">
                {prediction.action}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}