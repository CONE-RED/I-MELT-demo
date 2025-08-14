/**
 * QuickActionOverlays.tsx
 * Modal overlays for System Overview quick action buttons
 */

import React from 'react';
import { X, Power, Thermometer, Zap, Activity, AlertTriangle, BarChart3, TrendingUp, FileText, DollarSign, Beaker } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface OverlayProps {
  isVisible: boolean;
  onClose: () => void;
  heatData?: any;
}

/**
 * Controls Overlay - Process control interface
 */
export function ControlsOverlay({ isVisible, onClose, heatData }: OverlayProps) {
  if (!isVisible) return null;

  const controls = [
    { name: 'Arc Power', value: '96%', status: 'good', icon: <Zap className="w-4 h-4" /> },
    { name: 'Electrode Position', value: 'Auto', status: 'good', icon: <Activity className="w-4 h-4" /> },
    { name: 'Cooling System', value: 'Active', status: 'good', icon: <Thermometer className="w-4 h-4" /> },
    { name: 'Gas Flow', value: '245 m³/h', status: 'warning', icon: <Power className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Power className="w-5 h-5" />
            Process Controls
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">Real-time furnace control interface</p>
          
          <div className="grid grid-cols-2 gap-4">
            {controls.map((control) => (
              <div key={control.name} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {control.icon}
                    <span className="font-medium text-gray-900">{control.name}</span>
                  </div>
                  <Badge variant={control.status === 'good' ? 'default' : 'destructive'}>
                    {control.status}
                  </Badge>
                </div>
                <div className="text-lg font-semibold text-blue-600">
                  {control.value}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex gap-2">
              <Button size="sm">Auto Mode</Button>
              <Button size="sm" variant="outline">Manual Override</Button>
              <Button size="sm" variant="outline">Emergency Stop</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Alerts Overlay - Active alerts and notifications
 */
export function AlertsOverlay({ isVisible, onClose, heatData }: OverlayProps) {
  if (!isVisible) return null;

  const alerts = [
    { 
      id: 'temp-high',
      severity: 'warning',
      title: 'Temperature Approaching Limit',
      message: 'Steel temperature at 1588°C, approaching safety threshold',
      time: '2 min ago'
    },
    { 
      id: 'carbon-low',
      severity: 'info',
      title: 'Carbon Content Low',
      message: 'Current C: 0.09%, target: 0.13%',
      time: '5 min ago'
    },
    { 
      id: 'electrode-wear',
      severity: 'low',
      title: 'Electrode Consumption Normal',
      message: 'Wear rate within expected parameters',
      time: '12 min ago'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Active Alerts
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">Current process alerts and notifications</p>
          
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className={cn(
                "p-4 rounded-lg border-l-4",
                alert.severity === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
                alert.severity === 'info' ? 'border-l-blue-500 bg-blue-50' :
                'border-l-gray-500 bg-gray-50'
              )}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{alert.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-2">{alert.time}</p>
                  </div>
                  <Badge variant={
                    alert.severity === 'warning' ? 'destructive' :
                    alert.severity === 'info' ? 'default' : 'secondary'
                  }>
                    {alert.severity}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 flex gap-2">
            <Button size="sm">Acknowledge All</Button>
            <Button size="sm" variant="outline">Export Log</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Graphs Overlay - Process visualization charts
 */
export function GraphsOverlay({ isVisible, onClose, heatData }: OverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-white max-h-[80vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Process Graphs
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-gray-600">Real-time process visualization and trends</p>
          
          {/* Mock graph placeholders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-6 h-64 flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h4 className="font-medium">Temperature Trend</h4>
                <p className="text-sm text-gray-600">1570-1590°C over 45min</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 h-64 flex items-center justify-center">
              <div className="text-center">
                <Zap className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <h4 className="font-medium">Power Consumption</h4>
                <p className="text-sm text-gray-600">85-105% efficiency</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 h-64 flex items-center justify-center">
              <div className="text-center">
                <Activity className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-medium">Chemistry Evolution</h4>
                <p className="text-sm text-gray-600">C, Si, Mn, P, S trends</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 h-64 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <h4 className="font-medium">Process Timeline</h4>
                <p className="text-sm text-gray-600">Stage progression</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 flex gap-2">
            <Button size="sm">Export Charts</Button>
            <Button size="sm" variant="outline">Full Screen</Button>
            <Button size="sm" variant="outline">Historical Data</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Chemistry Overlay - Detailed chemistry analysis
 */
export function ChemistryOverlay({ isVisible, onClose, heatData }: OverlayProps) {
  if (!isVisible) return null;

  const chemistry = heatData?.chemSteel || {
    C: 0.09,
    Si: 0.15,
    Mn: 1.35,
    P: 0.018,
    S: 0.029
  };

  const chemistryElements = [
    { symbol: 'C', name: 'Carbon', value: chemistry.C, target: 0.13, unit: '%', status: chemistry.C < 0.10 ? 'low' : 'good' },
    { symbol: 'Si', name: 'Silicon', value: chemistry.Si, target: 0.25, unit: '%', status: chemistry.Si < 0.15 ? 'low' : 'good' },
    { symbol: 'Mn', name: 'Manganese', value: chemistry.Mn, target: 1.40, unit: '%', status: 'good' },
    { symbol: 'P', name: 'Phosphorus', value: chemistry.P, target: 0.025, unit: '%', status: chemistry.P <= 0.025 ? 'good' : 'high' },
    { symbol: 'S', name: 'Sulfur', value: chemistry.S, target: 0.020, unit: '%', status: chemistry.S > 0.025 ? 'high' : 'good' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Beaker className="w-5 h-5" />
            Chemistry Analysis
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-gray-600">Current steel chemistry composition and targets</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chemistryElements.map((element) => (
              <div key={element.symbol} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-700">
                      {element.symbol}
                    </div>
                    <span className="font-medium text-gray-900">{element.name}</span>
                  </div>
                  <Badge variant={
                    element.status === 'good' ? 'default' :
                    element.status === 'low' ? 'secondary' : 'destructive'
                  }>
                    {element.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Current:</span>
                    <span className="font-semibold">{(element.value * 100).toFixed(3)}{element.unit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Target:</span>
                    <span className="text-gray-700">{(element.target * 100).toFixed(3)}{element.unit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={cn(
                        "h-1.5 rounded-full",
                        element.status === 'good' ? "bg-green-400" :
                        element.status === 'low' ? "bg-blue-400" : "bg-red-400"
                      )}
                      style={{ width: `${Math.min(100, (element.value / element.target) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Recommendations</h4>
            <div className="space-y-2 text-sm">
              {chemistry.C < 0.10 && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Add 0.42t carbon to reach target specification</span>
                </div>
              )}
              {chemistry.S > 0.025 && (
                <div className="flex items-center gap-2 text-orange-600">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span>Desulfurization recommended to improve steel quality</span>
                </div>
              )}
              {chemistry.Si < 0.15 && (
                <div className="flex items-center gap-2 text-purple-600">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Silicon addition needed for proper deoxidation</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-4 flex gap-2">
            <Button size="sm">Request Sample</Button>
            <Button size="sm" variant="outline">Chemistry Report</Button>
            <Button size="sm" variant="outline">Historical Trends</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Reports Overlay - Generate and view reports
 */
export function ReportsOverlay({ isVisible, onClose, heatData }: OverlayProps) {
  if (!isVisible) return null;

  const reports = [
    { name: 'Heat Summary Report', description: 'Complete heat analysis with recommendations', format: 'PDF' },
    { name: 'ROI Analysis', description: 'Financial impact and savings calculation', format: 'Excel' },
    { name: 'Quality Report', description: 'Chemistry compliance and grade verification', format: 'PDF' },
    { name: 'Energy Efficiency', description: 'Power consumption and optimization metrics', format: 'Excel' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Reports & Analytics
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">Generate comprehensive reports for heat {heatData?.heat || '93378'}</p>
          
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{report.name}</h4>
                  <p className="text-sm text-gray-600">{report.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{report.format}</Badge>
                  <Button size="sm">Generate</Button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span>Estimated monthly savings: <strong className="text-green-600">€8,247</strong></span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}