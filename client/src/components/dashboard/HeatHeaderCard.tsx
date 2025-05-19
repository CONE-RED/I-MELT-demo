import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
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
      heat: "Heat",
      grade: "Steel Grade",
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
  
  return (
    <div className="dashboard-card h-full">
      <h2 className="text-lg font-semibold triangle mb-2">
        {labels[lang].heat} #{heat}
      </h2>
      <p className="text-sm text-cone-gray mb-3">{formattedDate}</p>
      
      <div className="grid grid-cols-2 text-sm gap-y-2">
        <span className="text-cone-gray">{labels[lang].grade}</span>
        <span className="font-medium">{grade}</span>
        <span className="text-cone-gray">{labels[lang].master}</span>
        <span>{master}</span>
        <span className="text-cone-gray">{labels[lang].operator}</span>
        <span>{operator}</span>
      </div>
      
      <div className="mt-4 flex items-center">
        <div className="flex-1">
          <div className="text-xs text-cone-gray">{labels[lang].confidence}</div>
          <Progress value={confidence} className="h-2 mt-1" />
        </div>
        <div className="flex items-center justify-center ml-3">
          <Zap 
            className={cn(
              "h-5 w-5 text-cone-red",
              modelStatus === 'training' && "animate-spin",
              modelStatus === 'predicting' && "animate-pulse"
            )} 
          />
        </div>
      </div>
    </div>
  );
}
