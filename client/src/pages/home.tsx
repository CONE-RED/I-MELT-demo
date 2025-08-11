import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { setupWebSocket, closeWebSocket } from '@/lib/socket';
import TopBar from '@/components/layout/TopBar';
import SideNav from '@/components/layout/SideNav';
import MissionControl from '@/components/dashboard/MissionControl';
import { useToast } from '@/hooks/use-toast';
import useMobile from '@/hooks/use-mobile';

export default function Home() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const isMobile = useMobile();
  
  const { heatNumber, wsConnected, error } = useSelector((state: RootState) => state);

  // Initialize WebSocket connection
  useEffect(() => {
    // Set up WebSocket connection
    setupWebSocket();
    
    return () => {
      closeWebSocket();
    };
  }, []);

  // Watch for heat number changes to subscribe to specific heat data
  useEffect(() => {
    if (heatNumber) {
      setupWebSocket(heatNumber);
    }
  }, [heatNumber]);
  
  // Show toast for errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
      
      dispatch({ type: 'SET_ERROR', payload: null });
    }
  }, [error, toast, dispatch]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopBar />
      
      <div className="flex flex-1 overflow-hidden">
        <SideNav />
        
        <main className="flex-1 overflow-y-auto">
          <MissionControl />
        </main>
      </div>
    </div>
  );
}
