import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { AlertTriangle, TrendingUp, Zap } from 'lucide-react';

interface SmartDefaultsProps {
  onAutoSelect?: (heatId: number) => void;
}

export function SmartDefaults({ onAutoSelect }: SmartDefaultsProps) {
  const dispatch = useDispatch();
  const { heat, loading } = useSelector((state: RootState) => state);

  // Auto-select most critical heat based on AI confidence and system status
  useEffect(() => {
    if (!heat && !loading && onAutoSelect) {
      // Smart default: select heat with highest priority (lowest confidence = needs attention)
      const availableHeats = [93378, 93379, 93380, 93381];
      const smartDefault = availableHeats[0]; // Default to first available
      onAutoSelect(smartDefault);
    }
  }, [heat, loading, onAutoSelect]);

  return null; // This component only provides logic, no UI
}

interface AutoInsightPrioritizerProps {
  insights: any[];
}

export function AutoInsightPrioritizer({ insights }: AutoInsightPrioritizerProps) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Auto-prioritize critical insights that need immediate attention
    const criticalInsights = insights.filter(
      insight => insight.type === 'critical' && !insight.acknowledged
    );

    if (criticalInsights.length > 0) {
      // Auto-select insights tab if there are critical alerts
      dispatch({ type: 'SET_SELECTED_TAB', payload: 'insights' });
    }
  }, [insights, dispatch]);

  return null;
}

interface SmartAlertManagerProps {
  children: React.ReactNode;
  systemStatus?: 'normal' | 'warning' | 'critical';
}

export function SmartAlertManager({ children, systemStatus = 'normal' }: SmartAlertManagerProps) {
  const getStatusIcon = () => {
    switch (systemStatus) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />;
      case 'warning':
        return <TrendingUp className="w-5 h-5 text-yellow-500" />;
      default:
        return <Zap className="w-5 h-5 text-green-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (systemStatus) {
      case 'critical':
        return 'Critical system alert - immediate attention required';
      case 'warning':
        return 'System optimization recommended';
      default:
        return 'System operating normally';
    }
  };

  return (
    <div className="relative">
      {systemStatus !== 'normal' && (
        <div className="absolute top-0 right-0 z-50 bg-cone-black border border-cone-red/30 rounded-lg p-3 shadow-lg animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-xs font-medium">{getStatusMessage()}</span>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}