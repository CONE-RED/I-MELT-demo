import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { AlertTriangle, CheckCircle, Clock, Zap, Thermometer, Battery, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SystemStatusBarProps {
  furnaceTemp?: number;
  powerLevel?: number;
  processStage?: string;
  confidence?: number;
  criticalAlerts?: number;
}

export function SystemStatusBar({
  furnaceTemp = 1590,
  powerLevel = 85,
  processStage = "Melting",
  confidence = 85,
  criticalAlerts = 1
}: SystemStatusBarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getOverallStatus = () => {
    if (criticalAlerts > 2) return { status: 'critical', message: 'CRITICAL SYSTEM ALERT' };
    if (criticalAlerts > 0 || confidence < 70) return { status: 'warning', message: 'ATTENTION REQUIRED' };
    if (confidence > 90 && powerLevel > 85) return { status: 'optimal', message: 'OPTIMAL OPERATION' };
    return { status: 'normal', message: 'NORMAL OPERATION' };
  };

  const overallStatus = getOverallStatus();

  const statusConfig = {
    critical: { bg: 'bg-red-500', text: 'text-white', icon: AlertTriangle, pulse: true },
    warning: { bg: 'bg-yellow-500', text: 'text-black', icon: Clock, pulse: false },
    optimal: { bg: 'bg-green-500', text: 'text-white', icon: CheckCircle, pulse: false },
    normal: { bg: 'bg-blue-500', text: 'text-white', icon: Activity, pulse: false }
  };

  const config = statusConfig[overallStatus.status as keyof typeof statusConfig];
  const StatusIcon = config.icon;

  return (
    <div className={cn(
      "w-full p-4 border-b border-cone-gray/20",
      config.bg,
      config.text,
      config.pulse && "animate-pulse"
    )}>
      <div className="flex items-center justify-between">
        {/* Primary Status */}
        <div className="flex items-center gap-3">
          <StatusIcon className="w-6 h-6" />
          <div>
            <div className="font-bold text-lg">{overallStatus.message}</div>
            <div className="text-sm opacity-90">{processStage} • Heat #{}</div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4" />
            <span>{furnaceTemp}°C</span>
          </div>
          <div className="flex items-center gap-2">
            <Battery className="w-4 h-4" />
            <span>{powerLevel}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span>{confidence}% AI</span>
          </div>
          <div className="font-mono">
            {currentTime.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}

interface CriticalAlertsBarProps {
  alerts: Array<{
    id: string;
    message: string;
    severity: 'critical' | 'warning';
    timestamp: string;
    actionable: boolean;
  }>;
  onDismiss: (id: string) => void;
  onApplyAction: (id: string) => void;
}

export function CriticalAlertsBar({ alerts, onDismiss, onApplyAction }: CriticalAlertsBarProps) {
  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  
  if (criticalAlerts.length === 0) return null;

  return (
    <div className="bg-red-600 text-white p-3 border-b border-red-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 animate-pulse" />
          <div>
            <div className="font-semibold">
              {criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? 's' : ''}
            </div>
            <div className="text-sm opacity-90">
              {criticalAlerts[0].message}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {criticalAlerts[0].actionable && (
            <button
              onClick={() => onApplyAction(criticalAlerts[0].id)}
              className="bg-white text-red-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100"
            >
              Apply Fix
            </button>
          )}
          <button
            onClick={() => onDismiss(criticalAlerts[0].id)}
            className="bg-red-700 text-white px-3 py-1 rounded text-sm hover:bg-red-800"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}

interface IndustrialLayoutProps {
  children: React.ReactNode;
  heatNumber?: number;
  systemData?: {
    furnaceTemp: number;
    powerLevel: number;
    processStage: string;
    confidence: number;
  };
  alerts?: Array<any>;
}

export function IndustrialLayout({ 
  children, 
  heatNumber, 
  systemData,
  alerts = []
}: IndustrialLayoutProps) {
  const heat = useSelector((state: RootState) => state.heat);
  
  const systemMetrics = systemData || {
    furnaceTemp: heat?.chemSteel ? 1590 : 1500,
    powerLevel: heat?.confidence || 85,
    processStage: "Melting",
    confidence: heat?.confidence || 85
  };

  const criticalAlerts = alerts.filter(a => a.type === 'critical' && !a.acknowledged);

  return (
    <div className="min-h-screen bg-cone-black text-cone-white">
      {/* System Status Bar - Always Visible */}
      <SystemStatusBar
        furnaceTemp={systemMetrics.furnaceTemp}
        powerLevel={systemMetrics.powerLevel}
        processStage={systemMetrics.processStage}
        confidence={systemMetrics.confidence}
        criticalAlerts={criticalAlerts.length}
      />
      
      {/* Critical Alerts Bar - Conditional */}
      <CriticalAlertsBar
        alerts={criticalAlerts}
        onDismiss={(id) => console.log('Dismiss alert:', id)}
        onApplyAction={(id) => console.log('Apply action:', id)}
      />
      
      {/* Main Content */}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}