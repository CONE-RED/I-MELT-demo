import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Square, RotateCcw, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SimulatorControlsProps {
  className?: string;
}

export default function SimulatorControls({ className = "" }: SimulatorControlsProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [seed, setSeed] = useState('42');
  const [status, setStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

  return (
    <Card className={`${className} border-2 border-gray-300`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-cone-red" />
            <span className="font-bold text-gray-900">Physics Simulator</span>
          </div>
          <Badge variant={isRunning ? "default" : "outline"} className={isRunning ? "bg-green-500" : ""}>
            {isRunning ? "Running" : "Stopped"}
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

        {/* Status Display */}
        {status && (
          <div className="space-y-2 p-3 bg-gray-50 rounded border">
            <div className="text-sm font-medium text-gray-800">Simulation Status:</div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              {status.running && (
                <>
                  <div>Time: {status.time}s</div>
                  <div>Stage: {status.stage}</div>
                  <div>Mass: {status.mass}t</div>
                  <div>Energy: {status.totalKwh?.toFixed(1)}kWh</div>
                </>
              )}
              {!status.running && (
                <div className="col-span-2 text-gray-500">No simulation running</div>
              )}
            </div>
          </div>
        )}

        {/* Information */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>• Deterministic EAF physics simulation</div>
          <div>• Stages: BOR → MELT → REFINE → TAP</div>
          <div>• Real-time updates via WebSocket</div>
          <div>• Same seed produces identical results</div>
        </div>

        <Button
          onClick={checkStatus}
          variant="ghost"
          size="sm"
          className="w-full text-xs"
        >
          Refresh Status
        </Button>
      </CardContent>
    </Card>
  );
}