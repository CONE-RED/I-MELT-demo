import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Square, RotateCcw, Settings, Thermometer, Zap, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { SimulationTick } from '@/types';

interface SimulatorControlsProps {
  className?: string;
}

export default function SimulatorControls({ className = "" }: SimulatorControlsProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [seed, setSeed] = useState('42');
  const [status, setStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const dispatch = useDispatch();
  const simulationData = useSelector((state: RootState) => state.simulationData);

  // Auto-refresh status when simulation is running  
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(checkStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [isRunning]);

  // Update heat data when simulation starts
  useEffect(() => {
    if (simulationData && isRunning) {
      // Dispatch updated heat data to reflect simulation state
      const updatedHeat = {
        ts: new Date(simulationData.ts).toISOString().slice(0, 19).replace('T', ' '),
        tempC: simulationData.tempC,
        stage: simulationData.stage,
        kwhPerT: simulationData.kwhPerT,
        powerFactor: simulationData.pf
      };
      // Could dispatch to update main heat display if needed
    }
  }, [simulationData]);

  const startSimulation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/demo/start?seed=${seed}`);
      const data = await response.json();
      
      if (data.ok) {
        setIsRunning(true);
        setStatus(data);
        toast({
          title: "Simulation Started",
          description: `Deterministic heat simulation running with seed ${data.seed}`,
          variant: "default"
        });
      } else {
        throw new Error(data.error || 'Failed to start simulation');
      }
    } catch (error: any) {
      toast({
        title: "Simulation Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stopSimulation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/demo/stop');
      const data = await response.json();
      
      if (data.ok) {
        setIsRunning(false);
        setStatus(null);
        toast({
          title: "Simulation Stopped",
          description: "Heat simulation has been stopped",
          variant: "default"
        });
      } else {
        throw new Error(data.error || 'Failed to stop simulation');
      }
    } catch (error: any) {
      toast({
        title: "Stop Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/demo/status');
      const data = await response.json();
      setStatus(data);
      setIsRunning(data.running);
    } catch (error) {
      console.error('Status check failed:', error);
    }
  };

  const resetSeed = () => {
    setSeed('42');
  };

  // Calculate stage progress
  const getStageProgress = (currentStage: string, time: number) => {
    switch (currentStage) {
      case 'BOR': return Math.min((time / 120) * 100, 100);
      case 'MELT': return Math.min(((time - 120) / 780) * 100, 100);
      case 'REFINE': return Math.min(((time - 900) / 300) * 100, 100);
      case 'TAP': return 100;
      default: return 0;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`${className} space-y-4`}>
      {/* Real-time Simulation Status - Prominent Display */}
      {simulationData && (
        <Card className="border-l-4 border-l-cone-red bg-gradient-to-r from-red-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-bold text-gray-900">Live EAF Simulation</span>
              </div>
              <Badge className="bg-green-500 text-white font-bold">
                {simulationData.stage}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Key Metrics Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white rounded border">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Thermometer className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-medium text-gray-600">TEMP</span>
                </div>
                <div className="text-lg font-bold text-gray-900">{Math.round(simulationData.tempC)}°C</div>
              </div>
              <div className="text-center p-3 bg-white rounded border">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs font-medium text-gray-600">ENERGY</span>
                </div>
                <div className="text-lg font-bold text-gray-900">{simulationData.kwhPerT.toFixed(1)} kWh/t</div>
              </div>
              <div className="text-center p-3 bg-white rounded border">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-medium text-gray-600">TIME</span>
                </div>
                <div className="text-lg font-bold text-gray-900">{formatTime(status?.time || 0)}</div>
              </div>
            </div>
            
            {/* Stage Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">Stage: {simulationData.stage}</span>
                <span className="text-gray-600">{getStageProgress(simulationData.stage, status?.time || 0).toFixed(0)}%</span>
              </div>
              <Progress value={getStageProgress(simulationData.stage, status?.time || 0)} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>BOR</span>
                <span>MELT</span>
                <span>REFINE</span>
                <span>TAP</span>
              </div>
            </div>

            {/* Chemistry Updates */}
            {simulationData.cPct !== undefined && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded">
                <div className="text-center">
                  <div className="text-xs text-gray-600">Carbon %</div>
                  <div className="font-bold text-gray-900">{(simulationData.cPct * 100).toFixed(3)}%</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600">Oxygen ppm</div>
                  <div className="font-bold text-gray-900">{(simulationData.oPct! * 10000).toFixed(0)} ppm</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Simulator Controls - Compact */}
      <Card className="border-2 border-gray-300">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-cone-red" />
              <span className="font-bold text-gray-900">Simulator Controls</span>
            </div>
            <Badge variant={isRunning ? "default" : "outline"} className={isRunning ? "bg-green-500" : ""}>
              {isRunning ? "Live" : "Ready"}
            </Badge>
          </CardTitle>
        </CardHeader>
      <CardContent className="space-y-4">
        {/* Seed Configuration */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Simulation Seed (Deterministic)
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="42"
              className="flex-1 text-sm"
              disabled={isRunning}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={resetSeed}
              disabled={isRunning}
              className="px-3"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Same seed = same heat progression. Use different seeds for variation.
          </p>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={startSimulation}
            disabled={isRunning || isLoading}
            className="flex-1 bg-cone-red hover:bg-cone-red/90 text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Physics Sim
          </Button>
          <Button
            onClick={stopSimulation}
            disabled={!isRunning || isLoading}
            variant="outline"
            className="flex-1"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop
          </Button>
        </div>

        {/* Quick Status */}
        {!simulationData && status && (
          <div className="p-2 bg-gray-50 rounded text-xs text-gray-600">
            {status.running ? `Running: ${status.stage} stage` : "No simulation active"}
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
}