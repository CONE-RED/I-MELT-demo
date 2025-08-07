import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';

interface StatusIndicatorProps {
  status: 'critical' | 'warning' | 'normal' | 'optimal';
  label: string;
  value?: string | number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusIndicator({ status, label, value, className, size = 'md' }: StatusIndicatorProps) {
  const statusConfig = {
    critical: {
      icon: AlertTriangle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30'
    },
    warning: {
      icon: Clock,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30'
    },
    normal: {
      icon: CheckCircle,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30'
    },
    optimal: {
      icon: Zap,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      border: 'border-green-500/30'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-lg border",
      config.bg,
      config.border,
      className
    )}>
      <Icon className={cn(config.color, sizeClasses[size])} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-cone-white">{label}</div>
        {value && (
          <div className={cn("text-xs", config.color)}>{value}</div>
        )}
      </div>
    </div>
  );
}

interface SystemHealthProps {
  furnaceTemp?: number;
  powerLevel?: number;
  processStage?: string;
  alerts?: number;
}

export function SystemHealth({ furnaceTemp = 1590, powerLevel = 85, processStage = "Melting", alerts = 1 }: SystemHealthProps) {
  const getHealthStatus = () => {
    if (alerts > 2) return 'critical';
    if (alerts > 0) return 'warning';
    if (powerLevel > 90) return 'optimal';
    return 'normal';
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-cone-white mb-3">System Status</h3>
      
      <StatusIndicator
        status={furnaceTemp > 1600 ? 'warning' : 'normal'}
        label="Furnace Temperature"
        value={`${furnaceTemp}°C`}
        size="sm"
      />
      
      <StatusIndicator
        status={powerLevel > 90 ? 'optimal' : powerLevel > 70 ? 'normal' : 'warning'}
        label="Power Level"
        value={`${powerLevel}%`}
        size="sm"
      />
      
      <StatusIndicator
        status={getHealthStatus()}
        label="Process Stage"
        value={processStage}
        size="sm"
      />
      
      {alerts > 0 && (
        <StatusIndicator
          status="warning"
          label="Active Alerts"
          value={`${alerts} pending`}
          size="sm"
        />
      )}
    </div>
  );
}