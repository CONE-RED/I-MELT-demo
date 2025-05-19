import { useState } from 'react';
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

export default function TopBar() {
  const dispatch = useDispatch();
  const { language, heatNumber, heat } = useSelector((state: RootState) => state);
  
  const [openHeatSelector, setOpenHeatSelector] = useState(false);
  
  const toggleLanguage = () => {
    dispatch({ type: 'SET_LANGUAGE', payload: language === 'en' ? 'ru' : 'en' });
  };
  
  const selectHeat = (heat: number) => {
    dispatch({ type: 'SET_HEAT_NUMBER', payload: heat });
    setOpenHeatSelector(false);
  };
  
  // Mock heat numbers - in a real app this would come from an API
  const availableHeats = [93378, 93379, 93380, 93381];
  
  return (
    <header className="flex items-center justify-between px-4 py-2 bg-cone-black border-b border-cone-gray/30">
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
              <Button variant="outline" className="bg-cone-gray/20 text-cone-white border-cone-gray/30">
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
        <div className="text-cone-gray">
          {heat?.ts ? new Date(heat.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
        </div>
      </div>
      
      {/* Language Toggle */}
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
    </header>
  );
}
