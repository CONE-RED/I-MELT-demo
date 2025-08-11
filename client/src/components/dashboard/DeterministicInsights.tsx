import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';

interface StaticInsight {
  title: string;
  why: string[];
  action: string[];
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'energy' | 'quality' | 'safety' | 'operational';
}

interface InsightResponse {
  heatId: number;
  timestamp: number;
  mode: 'deterministic' | 'ai';
  insight: StaticInsight;
  simulationState: {
    stage: string;
    tempC: number;
    kwhPerT: string;
    pf: string;
    foamIdx: string;
  };
}

interface DeterministicInsightsProps {
  heatId: number;
  isVisible?: boolean;
}

const DeterministicInsights: React.FC<DeterministicInsightsProps> = ({ 
  heatId, 
  isVisible = true 
}) => {
  const [aiModeEnabled, setAiModeEnabled] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Fetch deterministic insights
  const { data: insights, refetch, isLoading } = useQuery({
    queryKey: ['insights', heatId],
    queryFn: async () => {
      const response = await fetch(`/api/insights/${heatId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch insights');
      }
      return response.json() as Promise<InsightResponse>;
    },
    refetchInterval: 5000, // Refresh every 5 seconds
    enabled: isVisible
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'medium':
        return <Info className="w-5 h-5 text-yellow-600" />;
      case 'low':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.8) return 'text-blue-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleTryWithAI = async () => {
    setIsLoadingAI(true);
    setAiModeEnabled(true);
    
    // Simulate AI processing time for demo
    setTimeout(() => {
      setIsLoadingAI(false);
    }, 2000);
  };

  if (!isVisible || !insights) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">AI Insights</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {insights.mode === 'deterministic' ? 'Instant' : 'AI-Powered'}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${getConfidenceColor(insights.insight.confidence)}`}>
              {(insights.insight.confidence * 100).toFixed(0)}% confidence
            </span>
            {!aiModeEnabled && (
              <button
                onClick={handleTryWithAI}
                disabled={isLoadingAI}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoadingAI ? 'AI Thinking...' : 'Try with AI'}
              </button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main insight */}
        <div className="flex items-start space-x-3">
          {getSeverityIcon(insights.insight.severity)}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-gray-900">
                {insights.insight.title}
              </h3>
              <Badge 
                variant="secondary" 
                className={`text-xs ${getSeverityColor(insights.insight.severity)}`}
              >
                {insights.insight.severity.toUpperCase()}
              </Badge>
            </div>
            
            {/* WHY section - explaining reasoning */}
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 mb-1">WHY:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {insights.insight.why.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </div>
            
            {/* ACTION section - recommended steps */}
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 mb-1">RECOMMENDED ACTIONS:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {insights.insight.action.map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Current simulation state */}
        <div className="border-t pt-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Current State:</h4>
          <div className="grid grid-cols-5 gap-2 text-xs">
            <div className="text-center">
              <div className="font-medium text-gray-900">{insights.simulationState.stage}</div>
              <div className="text-gray-500">Stage</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900">{insights.simulationState.tempC}°C</div>
              <div className="text-gray-500">Temp</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900">{insights.simulationState.kwhPerT}</div>
              <div className="text-gray-500">kWh/t</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900">{insights.simulationState.pf}</div>
              <div className="text-gray-500">PF</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900">{insights.simulationState.foamIdx}%</div>
              <div className="text-gray-500">Foam</div>
            </div>
          </div>
        </div>
        
        {aiModeEnabled && (
          <div className="border-t pt-3 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>AI mode active - Enhanced insights available</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeterministicInsights;