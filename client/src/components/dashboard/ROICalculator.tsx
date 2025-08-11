import React, { useState } from 'react';
import { Calculator, Download, Edit3, TrendingUp, Euro } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation } from '@tanstack/react-query';

interface Baseline {
  kwhPerT: number;
  minPerHeat: number;
  heatsPerDay: number;
  electrodeKgPerHeat: number;
  massT: number;
}

interface Current {
  kwhPerT: number;
  minPerHeat: number;
  electrodeKgPerHeat: number;
}

interface Prices {
  kwh: number;
  electrode: number;
  prodValuePerMin: number;
}

interface ROIResult {
  perHeat: number;
  perMonth: number;
  breakdown: {
    energySaving: number;
    timeSaving: number;
    electrodeSaving: number;
  };
  details: {
    energyDelta: number;
    timeDelta: number;
    electrodeDelta: number;
  };
}

interface ROICalculatorProps {
  heatId: number;
  isVisible?: boolean;
}

const ROICalculator: React.FC<ROICalculatorProps> = ({ heatId, isVisible = true }) => {
  const [editingPrices, setEditingPrices] = useState(false);
  const [customPrices, setCustomPrices] = useState<Prices>({
    kwh: 0.11,
    electrode: 7.0,
    prodValuePerMin: 650
  });

  // Fetch current performance from simulation
  const { data: currentPerformance } = useQuery({
    queryKey: ['current-performance', heatId],
    queryFn: async () => {
      const response = await fetch(`/api/insights/${heatId}`);
      if (!response.ok) throw new Error('Failed to fetch performance data');
      const data = await response.json();
      return {
        kwhPerT: parseFloat(data.simulationState.kwhPerT) * 1000, // Convert to kWh/t
        minPerHeat: 62, // Simulated optimized time
        electrodeKgPerHeat: 3.8 // Optimized electrode consumption
      } as Current;
    },
    enabled: isVisible,
    refetchInterval: 10000
  });

  // Calculate ROI
  const { data: roiData, refetch: recalculateROI } = useQuery({
    queryKey: ['roi', heatId, customPrices],
    queryFn: async () => {
      if (!currentPerformance) return null;
      
      const response = await fetch('/api/roi/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current: currentPerformance,
          prices: customPrices
        })
      });
      
      if (!response.ok) throw new Error('Failed to calculate ROI');
      return response.json() as Promise<ROIResult>;
    },
    enabled: !!currentPerformance && isVisible
  });

  // Generate PDF report
  const generateReport = useMutation({
    mutationFn: async () => {
      if (!currentPerformance) throw new Error('No performance data available');
      
      const response = await fetch('/api/roi/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current: currentPerformance,
          prices: customPrices
        })
      });
      
      if (!response.ok) throw new Error('Failed to generate report');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `I-MELT_ROI_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  });

  const handlePriceChange = (field: keyof Prices, value: string) => {
    const numValue = parseFloat(value) || 0;
    setCustomPrices(prev => ({ ...prev, [field]: numValue }));
  };

  if (!isVisible || !roiData) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-green-600" />
            <CardTitle className="text-lg">ROI Calculator</CardTitle>
            <Badge variant="secondary" className="text-xs bg-green-50 text-green-700">
              Live Savings
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingPrices(!editingPrices)}
            >
              <Edit3 className="w-4 h-4 mr-1" />
              Prices
            </Button>
            <Button
              onClick={() => generateReport.mutate()}
              disabled={generateReport.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Download className="w-4 h-4 mr-1" />
              {generateReport.isPending ? 'Generating...' : 'PDF Report'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Primary ROI Display */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Euro className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-green-700">
                {roiData.perMonth.toLocaleString('en-EU', { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="text-sm text-green-600 font-medium">Monthly Savings</div>
            <div className="text-xs text-gray-500 mt-1">
              €{roiData.perHeat.toFixed(2)} per heat × 12 heats/day × 30 days
            </div>
          </div>
        </div>

        {/* Savings Breakdown */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-semibold text-blue-700">
              €{(roiData.breakdown.energySaving * 12 * 30).toFixed(0)}
            </div>
            <div className="text-xs text-blue-600">Energy</div>
            <div className="text-xs text-gray-500">
              -{roiData.details.energyDelta.toFixed(1)} kWh/t
            </div>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-lg font-semibold text-orange-700">
              €{(roiData.breakdown.timeSaving * 12 * 30).toFixed(0)}
            </div>
            <div className="text-xs text-orange-600">Time</div>
            <div className="text-xs text-gray-500">
              -{roiData.details.timeDelta.toFixed(1)} min
            </div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-semibold text-purple-700">
              €{(roiData.breakdown.electrodeSaving * 12 * 30).toFixed(0)}
            </div>
            <div className="text-xs text-purple-600">Electrodes</div>
            <div className="text-xs text-gray-500">
              -{roiData.details.electrodeDelta.toFixed(1)} kg
            </div>
          </div>
        </div>

        {/* Annual Projection */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Annual Projection</span>
          </div>
          <span className="text-lg font-bold text-gray-900">
            €{(roiData.perMonth * 12).toLocaleString('en-EU', { maximumFractionDigits: 0 })}
          </span>
        </div>

        {/* Price Editing Panel */}
        {editingPrices && (
          <div className="border-t pt-4 space-y-3">
            <div className="text-sm font-medium text-gray-700 mb-2">Edit Pricing Assumptions</div>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="kwh-price" className="text-xs">Energy (€/kWh)</Label>
                <Input
                  id="kwh-price"
                  type="number"
                  step="0.01"
                  value={customPrices.kwh}
                  onChange={(e) => handlePriceChange('kwh', e.target.value)}
                  className="text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="electrode-price" className="text-xs">Electrode (€/kg)</Label>
                <Input
                  id="electrode-price"
                  type="number"
                  step="0.1"
                  value={customPrices.electrode}
                  onChange={(e) => handlePriceChange('electrode', e.target.value)}
                  className="text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="time-value" className="text-xs">Time (€/min)</Label>
                <Input
                  id="time-value"
                  type="number"
                  step="10"
                  value={customPrices.prodValuePerMin}
                  onChange={(e) => handlePriceChange('prodValuePerMin', e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              Values update automatically. Based on European steel industry averages.
            </div>
          </div>
        )}
        
        {/* Live Data Indicator */}
        <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
          <span>Live performance data from heat {heatId}</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Updating</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ROICalculator;