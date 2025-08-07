import { CheckCircle, AlertTriangle, Clock, Zap, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SystemStatus = 'optimal' | 'normal' | 'warning' | 'critical' | 'offline';

interface StatusIndicatorProps {
  status: SystemStatus;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function StatusIndicator({ 
  status, 
  size = 'md', 
  showText = false, 
  className 
}: StatusIndicatorProps) {
  const configs = {
    optimal: {
      icon: CheckCircle,
      color: 'text-green-500',
      bg: 'bg-green-500/20',
      text: 'Optimal',
      pulse: false
    },
    normal: {
      icon: Zap,
      color: 'text-blue-500',
      bg: 'bg-blue-500/20',
      text: 'Normal',
      pulse: false
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/20',
      text: 'Warning',
      pulse: false
    },
    critical: {
      icon: AlertTriangle,
      color: 'text-red-500',
      bg: 'bg-red-500/20',
      text: 'Critical',
      pulse: true
    },
    offline: {
      icon: XCircle,
      color: 'text-gray-500',
      bg: 'bg-gray-500/20',
      text: 'Offline',
      pulse: false
    }
  };

  const config = configs[status];
  const Icon = config.icon;

  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn(
        'rounded-full p-1',
        config.bg,
        config.pulse && 'animate-pulse'
      )}>
        <Icon className={cn(sizes[size], config.color)} />
      </div>
      {showText && (
        <span className={cn('text-sm font-medium', config.color)}>
          {config.text}
        </span>
      )}
    </div>
  );
}

interface SystemHealthProps {
  temperature?: number;
  powerLevel?: number;
  confidence?: number;
  className?: string;
}

export function SystemHealth({ 
  temperature = 1590, 
  powerLevel = 85, 
  confidence = 85,
  className 
}: SystemHealthProps) {
  const getOverallStatus = (): SystemStatus => {
    if (confidence < 60 || powerLevel < 50) return 'critical';
    if (confidence < 80 || powerLevel < 70) return 'warning';
    if (confidence > 95 && powerLevel > 90) return 'optimal';
    return 'normal';
  };

  const getTemperatureStatus = (): SystemStatus => {
    if (temperature < 1400 || temperature > 1700) return 'critical';
    if (temperature < 1500 || temperature > 1650) return 'warning';
    return 'normal';
  };

  const getPowerStatus = (): SystemStatus => {
    if (powerLevel < 50) return 'critical';
    if (powerLevel < 70) return 'warning';
    if (powerLevel > 95) return 'optimal';
    return 'normal';
  };

  return (
    <div className={cn('grid grid-cols-3 gap-4', className)}>
      <div className="flex items-center gap-2">
        <StatusIndicator status={getTemperatureStatus()} size="sm" />
        <div className="text-xs">
          <div className="text-cone-gray">Temperature</div>
          <div className="font-medium">{temperature}°C</div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <StatusIndicator status={getPowerStatus()} size="sm" />
        <div className="text-xs">
          <div className="text-cone-gray">Power</div>
          <div className="font-medium">{powerLevel}%</div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <StatusIndicator status={getOverallStatus()} size="sm" />
        <div className="text-xs">
          <div className="text-cone-gray">AI Confidence</div>
          <div className="font-medium">{confidence}%</div>
        </div>
      </div>
    </div>
  );
}