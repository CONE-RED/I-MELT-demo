/**
 * Latency Badge Component
 * Phase 5: Shows WebSocket latency and buffering status
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Wifi, WifiOff, Clock } from 'lucide-react';

interface LatencyBadgeProps {
  className?: string;
  compact?: boolean;
}

export default function LatencyBadge({ className, compact = false }: LatencyBadgeProps) {
  const wsConnected = useSelector((state: RootState) => state.wsConnected);
  const connectionMetrics = useSelector((state: RootState) => state.connectionMetrics);
  
  const { latency, isBuffering, bufferSize } = connectionMetrics;
  
  // Determine badge variant based on connection state and latency
  const getBadgeVariant = () => {
    if (!wsConnected || isBuffering) return 'destructive';
    if (latency > 300) return 'destructive';
    if (latency > 200) return 'default';
    return 'secondary';
  };
  
  const getIcon = () => {
    if (!wsConnected || isBuffering) return <WifiOff className="w-3 h-3" />;
    if (latency > 300) return <Clock className="w-3 h-3 text-red-500" />;
    return <Wifi className="w-3 h-3" />;
  };
  
  const getText = () => {
    if (isBuffering) {
      return compact ? 'Offline (buffered)' : `Offline (${bufferSize}s buffer)`;
    }
    
    if (!wsConnected) {
      return compact ? 'Disconnected' : 'Connection lost';
    }
    
    if (latency > 0) {
      return compact ? `${Math.round(latency)}ms` : `Latency: ${Math.round(latency)}ms`;
    }
    
    return compact ? 'Connected' : 'Connected';
  };
  
  const getTooltip = () => {
    if (isBuffering) {
      return `WebSocket disconnected. Playing from buffer (${bufferSize} ticks available). Will auto-reconnect.`;
    }
    
    if (!wsConnected) {
      return 'WebSocket connection lost. Attempting to reconnect...';
    }
    
    if (latency > 300) {
      return `High latency detected (${Math.round(latency)}ms). May affect real-time updates.`;
    }
    
    if (latency > 200) {
      return `Moderate latency (${Math.round(latency)}ms). Connection is stable.`;
    }
    
    return `Excellent connection (${Math.round(latency)}ms latency). Real-time updates active.`;
  };
  
  return (
    <div className={cn("flex items-center gap-1", className)} title={getTooltip()}>
      <Badge 
        variant={getBadgeVariant()}
        className={cn(
          "text-xs font-medium flex items-center gap-1",
          compact ? "px-2 py-0.5" : "px-2 py-1",
          isBuffering && "animate-pulse"
        )}
      >
        {getIcon()}
        <span>{getText()}</span>
      </Badge>
      
      {/* Warning indicator for high latency */}
      {!compact && latency > 300 && wsConnected && !isBuffering && (
        <span className="text-xs text-red-600 font-medium">
          ⚠️ High latency
        </span>
      )}
      
      {/* Buffering indicator */}
      {!compact && isBuffering && (
        <span className="text-xs text-orange-600 font-medium animate-pulse">
          📦 Buffered playback
        </span>
      )}
    </div>
  );
}

/**
 * Compact version for status bars
 */
export function CompactLatencyBadge({ className }: { className?: string }) {
  return <LatencyBadge className={className} compact={true} />;
}