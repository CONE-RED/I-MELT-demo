import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import HeatHeaderCard from './HeatHeaderCard';
import ChargeBucketsMatrix from './ChargeBucketsMatrix';
import StageTimeline from './StageTimeline';
import AdditivesLedger from './AdditivesLedger';
import ChemistryDuoCharts from './ChemistryDuoCharts';
import AIInsightPane from './AIInsightPane';
import { Skeleton } from '@/components/ui/skeleton';
import useMobile from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { heat, loading } = useSelector((state: RootState) => state);
  const isMobile = useMobile();
  
  const renderSkeletonDashboard = () => (
    <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-12")}>
      <Skeleton className={cn("h-44", isMobile ? "col-span-1" : "col-span-3 row-span-2")} />
      <Skeleton className={cn("h-64", isMobile ? "col-span-1" : "col-span-6 row-span-4")} />
      <Skeleton className={cn("h-44", isMobile ? "col-span-1" : "col-span-12 row-span-2")} />
      <Skeleton className={cn("h-64", isMobile ? "col-span-1" : "col-span-6 row-span-3")} />
      <Skeleton className={cn("h-64", isMobile ? "col-span-1" : "col-span-3 row-span-3")} />
      <Skeleton className={cn("h-96", isMobile ? "col-span-1" : "col-span-3 row-span-4")} />
    </div>
  );
  
  const renderNoData = () => (
    <div className="flex flex-col items-center justify-center h-[80vh] text-cone-gray">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-cone-red/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h2 className="text-xl font-medium mb-2">No Heat Data Available</h2>
      <p className="text-center max-w-md">Select a heat number from the dropdown menu above to load furnace data.</p>
    </div>
  );
  
  if (loading) {
    return renderSkeletonDashboard();
  }
  
  if (!heat) {
    return renderNoData();
  }
  
  return (
    <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-12")}>
      {/* [A] Heat Header Card (3×2) */}
      <div className={cn(isMobile ? "col-span-1" : "col-span-3 row-span-2")}>
        <HeatHeaderCard
          ts={heat.ts}
          heat={heat.heat}
          grade={heat.grade}
          master={heat.master}
          operator={heat.operator}
          modelStatus={heat.modelStatus}
          confidence={heat.confidence}
        />
      </div>
      
      {/* [B] Charge Buckets Matrix (6×4) */}
      <div className={cn(isMobile ? "col-span-1" : "col-span-6 row-span-4")}>
        <ChargeBucketsMatrix buckets={heat.buckets} />
      </div>
      
      {/* [C] Stage Timeline (12×2) */}
      <div className={cn(isMobile ? "col-span-1" : "col-span-12 row-span-2")}>
        <StageTimeline stages={heat.stages} />
      </div>
      
      {/* [D] Additives Ledger (6×3) */}
      <div className={cn(isMobile ? "col-span-1" : "col-span-6 row-span-3")}>
        <AdditivesLedger additives={heat.additives} />
      </div>
      
      {/* [E] Chemistry Duo (3×3 each) */}
      <div className={cn(isMobile ? "col-span-1" : "col-span-3 row-span-3")}>
        <ChemistryDuoCharts chemSteel={heat.chemSteel} chemSlag={heat.chemSlag} />
      </div>
      
      {/* [F] AI Insight Pane (3×4) */}
      <div className={cn(isMobile ? "col-span-1" : "col-span-3 row-span-4")}>
        <AIInsightPane insights={heat.insights} />
      </div>
    </div>
  );
}
