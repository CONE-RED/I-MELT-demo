import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import HeatHeaderCard from './HeatHeaderCard';
import ChargeBucketsMatrix from './ChargeBucketsMatrix';
import StageTimeline from './StageTimeline';
import LazyFlowStageTimeline from './LazyFlowStageTimeline';
import AdditivesLedger from './AdditivesLedger';
import ChemistryDuoCharts from './ChemistryDuoCharts';
import AIInsightPane from './AIInsightPane';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingState } from '@/components/ui/loading-spinner';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { SmartDefaults, AutoInsightPrioritizer, SmartAlertManager } from '@/components/ui/smart-defaults';
import { IndustrialLayout } from '@/components/industrial/status-first-layout';
import { OperatorShortcuts, ContextualActions, PerformanceMetrics } from '@/components/industrial/operator-efficiency';
import { AnomalyDetector, PredictiveInsights } from '@/components/industrial/anomaly-detection';
import { OneClickReport } from '@/components/industrial/export-reporting';
import NotificationCenter, { Notification } from '@/components/ui/notification-center';
import AIChatWidget from '@/components/chat/AIChatWidget';
import useMobile from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const heat = useSelector((state: RootState) => state.heat);
  const loading = useSelector((state: RootState) => state.loading);
  const isMobile = useMobile();
  const [shortcutsVisible, setShortcutsVisible] = useState(false);
  const [showAnomalyDetector, setShowAnomalyDetector] = useState(true);
  const [showContextualActions, setShowContextualActions] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [useLazyFlowTimeline, setUseLazyFlowTimeline] = useState(true);

  // Determine system status based on heat data
  const getSystemStatus = () => {
    if (!heat) return 'normal';
    const criticalInsights = heat.insights?.filter(i => i.type === 'critical' && !i.acknowledged) || [];
    if (criticalInsights.length > 2) return 'critical';
    if (criticalInsights.length > 0 || heat.confidence < 70) return 'warning';
    return 'normal';
  };

  // Operator shortcuts for industrial efficiency
  const operatorShortcuts = [
    { key: 'Ctrl+1', description: 'Focus Heat Header', action: () => console.log('Focus heat header') },
    { key: 'Ctrl+2', description: 'Open Materials', action: () => console.log('Focus materials') },
    { key: 'Ctrl+3', description: 'View Timeline', action: () => console.log('Focus timeline') },
    { key: 'Ctrl+A', description: 'Acknowledge All Alerts', action: () => console.log('Acknowledge alerts') },
    { key: 'Ctrl+E', description: 'Export Report', action: () => console.log('Export report') },
  ];

  // Performance metrics for operator feedback
  const performanceMetrics = {
    efficiency: 94,
    accuracy: 97,
    timeToTarget: '12:34',
    energySavings: 8.7
  };

  // Handle notifications
  const handleAnomalyDetected = (anomaly: any) => {
    const notification: Notification = {
      id: anomaly.id || `anomaly-${Date.now()}`,
      type: 'anomaly',
      severity: anomaly.severity,
      title: `${anomaly.parameter} ${anomaly.type.charAt(0).toUpperCase() + anomaly.type.slice(1)}`,
      message: `${anomaly.parameter} deviation detected`,
      parameter: anomaly.parameter,
      currentValue: anomaly.currentValue,
      expectedValue: anomaly.expectedValue,
      deviation: anomaly.deviation,
      recommendation: anomaly.recommendation,
      confidence: anomaly.confidence,
      timestamp: new Date(),
      acknowledged: false
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep only latest 10
  };

  const handleAcknowledge = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, acknowledged: true } : n));
  };

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
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
    return <LoadingState message="Loading heat data..." />;
  }
  
  if (!heat) {
    return renderNoData();
  }
  
  return (
    <IndustrialLayout 
      heatNumber={heat?.heat}
      alerts={heat?.insights || []}
      systemData={{
        furnaceTemp: 1590,
        powerLevel: heat?.confidence || 85,
        processStage: "Melting",
        confidence: heat?.confidence || 85
      }}
    >
      <SmartDefaults />
      {heat && <AutoInsightPrioritizer insights={heat.insights || []} />}
      
      {/* Operator Efficiency Tools */}
      <OperatorShortcuts
        shortcuts={operatorShortcuts}
        isVisible={shortcutsVisible}
        onToggle={() => setShortcutsVisible(!shortcutsVisible)}
      />
      
      {/* AI monitoring runs in background - notifications show in TopBar */}
      <AnomalyDetector
        heatData={heat}
        onAnomalyDetected={handleAnomalyDetected}
        onHide={() => setShowAnomalyDetector(false)}
      />
      
      <PredictiveInsights
        heatData={heat}
      />
      
      {/* Quick Reports moved to sidebar navigation */}
      
      <ErrorBoundary>
        <div className={cn("grid gap-3", isMobile ? "grid-cols-1" : "grid-cols-12")}>
          {/* [A] Heat Header Card (3×2) - Primary Information */}
          <div className={cn(isMobile ? "col-span-1" : "col-span-3 row-span-2")}>
            <ErrorBoundary>
              <HeatHeaderCard
              ts={heat.ts}
              heat={heat.heat}
              grade={heat.grade}
              master={heat.master}
              operator={heat.operator}
              modelStatus={heat.modelStatus}
              confidence={heat.confidence}
            />
          </ErrorBoundary>
        </div>
      
      {/* [B] Charge Buckets Matrix (6×4) */}
      <div className={cn(isMobile ? "col-span-1" : "col-span-6 row-span-4")}>
        <ChargeBucketsMatrix buckets={heat.buckets} />
      </div>
      
      {/* [F] AI Insight Pane (3×4) */}
      <div className={cn(isMobile ? "col-span-1" : "col-span-3 row-span-4")}>
        <AIInsightPane insights={heat.insights} />
      </div>
      
      {/* [C] Stage Timeline (12×2) - LazyFlow Enhanced */}
      <div className={cn(isMobile ? "col-span-1" : "col-span-12 row-span-2")}>
        {useLazyFlowTimeline ? (
          <LazyFlowStageTimeline stages={heat.stages} />
        ) : (
          <StageTimeline stages={heat.stages} />
        )}
      </div>
      
      {/* [D] Additives Ledger (6×3) */}
      <div className={cn(isMobile ? "col-span-1" : "col-span-6 row-span-3")}>
        <AdditivesLedger additives={heat.additives} />
      </div>
      
      {/* [E] Chemistry Duo (3×3 each) */}
      <div className={cn(isMobile ? "col-span-1" : "col-span-6 row-span-3")}>
        <ChemistryDuoCharts chemSteel={heat.chemSteel} chemSlag={heat.chemSlag} />
      </div>
      
      {/* Performance Metrics - Industrial Enhancement */}
      <div className={cn(isMobile ? "col-span-1" : "col-span-3")}>
        <PerformanceMetrics metrics={performanceMetrics} />
      </div>
      
      {/* AI Chat Widget - Quick Access */}
      <div className={cn(isMobile ? "col-span-1" : "col-span-3")}>
        <AIChatWidget heatData={heat} />
      </div>
        </div>
      </ErrorBoundary>
    </IndustrialLayout>
  );
}
