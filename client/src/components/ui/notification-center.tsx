import { useState, useEffect } from 'react';
import { Bell, BellRing, X, Settings, Eye, EyeOff, AlertTriangle, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export interface Notification {
  id: string;
  type: 'anomaly' | 'efficiency' | 'prediction' | 'action';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  parameter?: string;
  currentValue?: number;
  expectedValue?: number;
  deviation?: number;
  recommendation?: string;
  confidence?: number;
  timestamp: Date;
  acknowledged?: boolean;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onAcknowledge: (id: string) => void;
  onDismiss: (id: string) => void;
  className?: string;
}

export function NotificationCenter({ notifications, onAcknowledge, onDismiss, className }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [enabledTypes, setEnabledTypes] = useState({
    anomaly: true,
    efficiency: true,
    prediction: true,
    action: true
  });

  const unacknowledgedCount = notifications.filter(n => !n.acknowledged).length;
  const hasHighPriority = notifications.some(n => 
    (n.severity === 'critical' || n.severity === 'high') && !n.acknowledged
  );

  const filteredNotifications = notifications.filter(n => enabledTypes[n.type]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 border-red-300 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default: return 'bg-blue-100 border-blue-300 text-blue-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': 
      case 'high': 
        return <AlertTriangle className="w-4 h-4" />;
      case 'medium': 
        return <TrendingUp className="w-4 h-4" />;
      default: 
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'anomaly': return 'Process Anomaly';
      case 'efficiency': return 'Efficiency Alert';
      case 'prediction': return 'Predictive Insight';
      case 'action': return 'Action Required';
      default: return 'Notification';
    }
  };

  const formatValue = (value: number | undefined) => {
    if (value === undefined) return '';
    return value.toLocaleString('de-DE', { 
      minimumFractionDigits: 3, 
      maximumFractionDigits: 3 
    });
  };

  return (
    <div className={cn("relative", className)}>
      {/* Attention Button */}
      <Button
        variant={hasHighPriority ? "destructive" : unacknowledgedCount > 0 ? "default" : "outline"}
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative",
          hasHighPriority && "animate-pulse"
        )}
      >
        {hasHighPriority ? (
          <BellRing className="w-4 h-4 mr-2" />
        ) : (
          <Bell className="w-4 h-4 mr-2" />
        )}
        {unacknowledgedCount > 0 && (
          <Badge 
            variant="secondary" 
            className="ml-2 px-1.5 py-0.5 text-xs bg-cone-red text-white"
          >
            {unacknowledgedCount}
          </Badge>
        )}
        Alerts
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <Card className="absolute top-full right-0 mt-2 w-96 max-h-96 overflow-hidden z-50 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Process Alerts
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Real-time Notifications</h4>
                <div className="space-y-2">
                  {Object.entries(enabledTypes).map(([type, enabled]) => (
                    <div key={type} className="flex items-center justify-between">
                      <label className="text-sm text-gray-700 capitalize">
                        {getTypeLabel(type)}
                      </label>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) =>
                          setEnabledTypes(prev => ({ ...prev, [type]: checked }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-0">
            <div className="max-h-80 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p>All systems normal</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-3 border-l-4 bg-white hover:bg-gray-50",
                        getSeverityColor(notification.severity),
                        notification.acknowledged && "opacity-60"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getSeverityIcon(notification.severity)}
                            <span className="text-sm font-medium">
                              {notification.title}
                            </span>
                            {notification.confidence && (
                              <Badge variant="outline" className="text-xs">
                                {notification.confidence}% confidence
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>

                          {notification.currentValue !== undefined && notification.expectedValue !== undefined && (
                            <div className="text-xs text-gray-500 mb-2">
                              Current: {formatValue(notification.currentValue)}% | 
                              Target: {formatValue(notification.expectedValue)}% | 
                              Deviation: {notification.deviation?.toFixed(1)}%
                            </div>
                          )}

                          {notification.recommendation && (
                            <div className="text-xs bg-blue-50 text-blue-800 p-2 rounded">
                              <strong>Recommendation:</strong> {notification.recommendation}
                            </div>
                          )}

                          <div className="text-xs text-gray-400 mt-2">
                            {notification.timestamp.toLocaleTimeString()}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 ml-2">
                          {!notification.acknowledged && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onAcknowledge(notification.id)}
                              className="h-6 px-2 text-xs"
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDismiss(notification.id)}
                            className="h-6 px-2 text-xs"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default NotificationCenter;