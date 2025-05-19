import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { Stage } from '@/types';
import { cn } from '@/lib/utils';

interface StageTimelineProps {
  stages: Stage[];
}

export default function StageTimeline({ stages }: StageTimelineProps) {
  const { language } = useSelector((state: RootState) => state);
  
  const labels = {
    en: {
      title: "Stage Timeline",
      actualProgress: "Actual Progress",
      plannedMilestone: "Planned Milestone",
      currentTime: "Current Time",
      stage: "Stage",
      bucket: "Bucket"
    },
    ru: {
      title: "Временная шкала этапов",
      actualProgress: "Фактический прогресс",
      plannedMilestone: "Плановая веха",
      currentTime: "Текущее время",
      stage: "Этап",
      bucket: "Бадья"
    }
  };
  
  const lang = language === 'en' ? 'en' : 'ru';
  
  // Group stages by bucket
  const stagesByBucket = stages.reduce((acc, stage) => {
    if (!acc[stage.bucket]) {
      acc[stage.bucket] = [];
    }
    acc[stage.bucket].push(stage);
    return acc;
  }, {} as Record<number, Stage[]>);
  
  // Calculate timeline percentages
  const timeToMinutes = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const calculatePercentage = (timeStr: string, maxMinutes: number = 90) => {
    return (timeToMinutes(timeStr) / maxMinutes) * 100;
  };
  
  // Find the current time position (using the most recent 'current' stage)
  const currentStage = stages.find(s => s.status === 'current');
  const currentTimePosition = currentStage 
    ? calculatePercentage(currentStage.plannedTime) * 0.75 
    : 22; // Default position if no current stage
  
  return (
    <div className="dashboard-card overflow-hidden">
      <h2 className="text-lg font-semibold triangle mb-3">
        {labels[lang].title}
      </h2>
      
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="flex justify-between mb-2 text-xs text-cone-gray">
            <div>00:00</div>
            <div>00:10</div>
            <div>00:20</div>
            <div>00:30</div>
            <div>00:40</div>
            <div>00:50</div>
            <div>01:00</div>
            <div>01:10</div>
            <div>01:20</div>
          </div>
          
          {/* Timeline content */}
          <div className="relative">
            {/* Current time indicator */}
            <div 
              className="absolute top-0 bottom-0 w-px bg-cone-white z-10" 
              style={{ left: `${currentTimePosition}%` }}
            />
            
            {/* Buckets and stages */}
            {Object.entries(stagesByBucket).map(([bucketId, bucketStages]) => (
              <div key={`bucket-${bucketId}`} className="mb-4">
                <div className="flex items-center mb-1">
                  <div className="w-20 text-sm font-medium">
                    {labels[lang].bucket} {bucketId}
                  </div>
                  <div className="flex-1">
                    {bucketStages.map(stage => {
                      const startPercentage = calculatePercentage(stage.plannedTime) - 
                        (stage.status === 'done' ? 0 : 5);
                      const width = stage.status === 'planned' ? 0 : 
                        stage.status === 'current' ? 40 : 100;
                      
                      return (
                        <div 
                          key={`stage-${bucketId}-${stage.stage}`} 
                          className={cn(
                            "relative h-5 my-1 rounded-md overflow-hidden",
                            stage.status === 'planned' ? "bg-cone-gray/30" : "bg-cone-gray/80"
                          )}
                        >
                          {stage.status !== 'planned' && (
                            <div 
                              className="absolute h-full bg-gradient-to-r from-cone-red/70 to-cone-red rounded-l-md"
                              style={{ 
                                width: `${width}%`, 
                                left: `${startPercentage}%` 
                              }}
                            >
                              <div className="flex h-full items-center justify-center text-xs">
                                {labels[lang].stage} {stage.stage}
                              </div>
                            </div>
                          )}
                          <div 
                            className="absolute h-full border-r-2 border-dashed border-white" 
                            style={{ left: `${startPercentage + (stage.status === 'done' ? 100 : 0)}%` }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-2 text-xs flex justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gradient-to-r from-cone-red/70 to-cone-red rounded-sm mr-1" />
              <span>{labels[lang].actualProgress}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 border border-dashed border-white rounded-sm mr-1" />
              <span>{labels[lang].plannedMilestone}</span>
            </div>
            <div className="flex items-center">
              <div className="w-px h-3 bg-cone-white mr-1" />
              <span>{labels[lang].currentTime}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
