import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import NotificationCenter, { Notification } from '@/components/ui/notification-center';

export default function TopBar() {
  const dispatch = useDispatch();
  const { language, heatNumber, heat } = useSelector((state: RootState) => state);
  
  const [openHeatSelector, setOpenHeatSelector] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const toggleLanguage = () => {
    dispatch({ type: 'SET_LANGUAGE', payload: language === 'en' ? 'ru' : 'en' });
  };
  
  const selectHeat = async (heat: number) => {
    dispatch({ type: 'SET_HEAT_NUMBER', payload: heat });
    setOpenHeatSelector(false);
    
    // Fetch new heat data when switching heats
    try {
      const response = await fetch(`/api/heat/${heat}`);
      const heatData = await response.json();
      dispatch({ type: 'SET_HEAT_DATA', payload: heatData });
      console.log(`Switched to heat ${heat}: ${heatData.grade} (${heatData.master}/${heatData.operator})`);
    } catch (error) {
      console.error('Failed to fetch heat data:', error);
    }
  };
  
  // Mock heat numbers - in a real app this would come from an API
  const availableHeats = [93378, 93379, 93380, 93381];

  // Demo notifications - simulate real-time process monitoring
  useEffect(() => {
    if (heat) {
      const demoNotifications: Notification[] = [
        {
          id: 'carbon-deviation',
          type: 'anomaly',
          severity: 'high',
          title: 'Carbon Content Drift',
          message: 'Carbon level below target specification',
          parameter: 'Carbon Content',
          currentValue: 0.09,
          expectedValue: 0.13,
          deviation: -30.8,
          recommendation: 'Increase carbon addition by 0.42t in next 5 minutes',
          confidence: 94,
          timestamp: new Date(),
          acknowledged: false
        },
        {
          id: 'sulfur-alert',
          type: 'anomaly',
          severity: 'medium',
          title: 'Sulfur Content Spike',
          message: 'Sulfur level exceeding target range',
          parameter: 'Sulfur Content',
          currentValue: 0.029,
          expectedValue: 0.020,
          deviation: 45.0,
          recommendation: 'Add desulfurizing agents and monitor gas flow',
          confidence: 87,
          timestamp: new Date(Date.now() - 120000), // 2 minutes ago
          acknowledged: false
        },
        {
          id: 'efficiency-tip',
          type: 'efficiency',
          severity: 'low',
          title: 'Energy Optimization',
          message: 'Potential energy savings detected',
          recommendation: 'Consider reducing power by 3% for optimal efficiency',
          confidence: 78,
          timestamp: new Date(Date.now() - 300000), // 5 minutes ago
          acknowledged: true
        }
      ];
      
      setNotifications(demoNotifications);
    }
  }, [heat]);

  const handleAcknowledge = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, acknowledged: true } : n));
  };

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  return (
    <header className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 shadow-sm">
      {/* Logo */}
      <div className="flex items-center">
        <div className="text-cone-red font-bold text-xl flex items-center">
          <span className="mr-1">◭</span> I-MELT
        </div>
      </div>
      
      {/* Heat Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span>{language === 'en' ? 'Heat' : 'Плавка'}</span>
          <DropdownMenu open={openHeatSelector} onOpenChange={setOpenHeatSelector}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-gray-100 text-gray-900 border-gray-300 hover:bg-gray-200">
                {heatNumber || '-'}
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {availableHeats.map(heat => (
                <DropdownMenuItem key={heat} onClick={() => selectHeat(heat)}>
                  {heat}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="text-gray-600">
          {heat?.ts ? new Date(heat.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
        </div>
      </div>
      
      {/* Notification Center & Language Toggle */}
      <div className="flex items-center gap-4">
        <NotificationCenter
          notifications={notifications}
          onAcknowledge={handleAcknowledge}
          onDismiss={handleDismiss}
        />
        
        <div className="flex items-center gap-2">
          <Button 
            variant={language === 'en' ? 'default' : 'outline'} 
            className="px-2 py-1 h-8 text-sm" 
            onClick={() => dispatch({ type: 'SET_LANGUAGE', payload: 'en' })}
          >
            EN
          </Button>
          <Button 
            variant={language === 'ru' ? 'default' : 'outline'} 
            className="px-2 py-1 h-8 text-sm" 
            onClick={() => dispatch({ type: 'SET_LANGUAGE', payload: 'ru' })}
          >
            RU
          </Button>
        </div>
      </div>
    </header>
  );
}
