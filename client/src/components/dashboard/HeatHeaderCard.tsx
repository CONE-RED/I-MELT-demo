import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { SystemHealth } from '@/components/ui/status-indicator';
import { ProgressiveDetails } from '@/components/ui/collapsible-section';
import { cn } from '@/lib/utils';

interface HeatHeaderProps {
  ts: string;
  heat: number;
  grade: string;
  master: string;
  operator: string;
  modelStatus: 'idle' | 'training' | 'predicting';
  confidence: number;
}

export default function HeatHeaderCard({ 
  ts, 
  heat, 
  grade, 
  master, 
  operator,
  modelStatus,
  confidence
}: HeatHeaderProps) {
  const { language } = useSelector((state: RootState) => state);
  
  const formattedDate = new Date(ts).toLocaleString(
    language === 'en' ? 'en-US' : 'ru-RU',
    { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }
  );
  
  const labels = {
    en: {
      heat: "Heat No.",
      grade: "Grade Set",
      master: "Shift Supervisor",
      operator: "Furnace Operator",
      confidence: "AI Confidence",
    },
    ru: {
      heat: "Плавка",
      grade: "Марка стали",
      master: "Мастер",
      operator: "Сталевар",
      confidence: "Точность ИИ",
    }
  };
  
  const lang = language === 'en' ? 'en' : 'ru';
  
  const getSystemStatus = () => {
    if (confidence < 70) return 'warning';
    if (confidence > 90) return 'optimal';
    return 'normal';
  };

  return (
    <div className="dashboard-card h-full">
      {/* Primary Information - Heat Number & Status */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold triangle text-cone-white">
          #{heat}
        </h2>
        <div className="flex items-center gap-2">
          {confidence > 90 ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : confidence < 70 ? (
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
          ) : (
            <Zap className={cn(
              "w-5 h-5 text-cone-red",
              modelStatus === 'training' && "animate-spin",
              modelStatus === 'predicting' && "animate-pulse"
            )} />
          )}
        </div>
      </div>
      
      {/* Secondary Information - Grade & Confidence */}
      <div className="mb-4">
        <div className="text-lg font-medium text-cone-white mb-1">{grade}</div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-cone-gray">{labels[lang].confidence}</span>
          <Progress value={confidence} className="h-1.5 flex-1" />
          <span className="text-xs font-medium text-cone-white">{confidence}%</span>
        </div>
      </div>
      
      {/* Progressive Details - Personnel Info */}
      <ProgressiveDetails
        summary={
          <div className="text-xs text-cone-gray">
            {formattedDate}
          </div>
        }
        details={
          <div className="grid grid-cols-1 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-cone-gray">{labels[lang].master}</span>
              <span className="font-medium">{master}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cone-gray">{labels[lang].operator}</span>
              <span className="font-medium">{operator}</span>
            </div>
          </div>
        }
        expandText="Show personnel"
        collapseText="Hide personnel"
      />
    </div>
  );
}
