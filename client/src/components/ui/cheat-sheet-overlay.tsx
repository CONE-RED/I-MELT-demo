import React from 'react';
import { X, Zap, Droplets, Thermometer, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CheatSheetOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

const CheatSheetOverlay: React.FC<CheatSheetOverlayProps> = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  const scenarios = [
    {
      key: '1',
      icon: <Zap className="w-5 h-5 text-yellow-500" />,
      title: 'Energy Spike Crisis',
      description: 'Simulate electrical instability and power factor drop',
      impact: '7.5 kWh/t savings potential'
    },
    {
      key: '2', 
      icon: <Droplets className="w-5 h-5 text-blue-500" />,
      title: 'Foam Collapse Event',
      description: 'Slag foam collapse exposing electrodes to radiation',
      impact: '+12 hours electrode life'
    },
    {
      key: '3',
      icon: <Thermometer className="w-5 h-5 text-red-500" />,
      title: 'Temperature Risk to Caster',
      description: 'Steel temperature approaching caster limits',
      impact: '+2 quality grades possible'
    },
    {
      key: 'R',
      icon: <RotateCcw className="w-5 h-5 text-green-500" />,
      title: 'Apply Recovery Action',
      description: 'Execute recommended recovery procedure',
      impact: 'Immediate problem resolution'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Demo Control Shortcuts</h2>
            <p className="text-sm text-gray-600 mt-1">Hotkeys for scripted industrial scenarios</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="p-6 space-y-4">
          {scenarios.map((scenario) => (
            <div
              key={scenario.key}
              className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-mono font-bold text-lg">
                {scenario.key}
              </div>
              <div className="flex-shrink-0 mt-1">
                {scenario.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1">{scenario.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{scenario.description}</p>
                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  {scenario.impact}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded">?</kbd>
            <span>Show/hide this help overlay</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press any scenario key to inject realistic industrial problems with visible before/after KPIs.
            Decision makers can see cause→effect relationships in under 60 seconds.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheatSheetOverlay;