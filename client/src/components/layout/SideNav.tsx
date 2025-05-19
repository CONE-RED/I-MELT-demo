import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useLocation } from 'wouter';
import useMobile from '@/hooks/use-mobile';
import { 
  BarChart3, 
  Package, 
  Zap, 
  FlaskRound, 
  Settings
} from 'lucide-react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  labelRu: string;
  active?: boolean;
  onClick?: () => void;
}

function NavItem({ icon, label, labelRu, active, onClick }: NavItemProps) {
  const { language } = useSelector((state: RootState) => state);
  const isMobile = useMobile();
  
  return (
    <a 
      href="#" 
      className={cn(
        "flex items-center gap-2 py-2 px-3 rounded-md transition",
        isMobile && "flex-col items-center px-1",
        active 
          ? "text-cone-white bg-cone-red/20 border-l-2 border-cone-red" 
          : "text-cone-gray hover:text-cone-white hover:bg-cone-gray/20"
      )}
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
      }}
    >
      {icon}
      <span className={cn(isMobile && "text-xs")}>
        {language === 'en' ? label : labelRu}
      </span>
    </a>
  );
}

export default function SideNav() {
  const [location, setLocation] = useLocation();
  const isMobile = useMobile();
  
  return (
    <nav className={cn(
      "border-r border-cone-gray/30 p-4 flex flex-col gap-4",
      isMobile ? "w-16 p-2" : "w-48"
    )}>
      <NavItem 
        icon={<BarChart3 className="h-5 w-5" />} 
        label="Heat Log" 
        labelRu="Журнал плавок"
        active={true}
        onClick={() => setLocation('/')}
      />
      <NavItem 
        icon={<Package className="h-5 w-5" />} 
        label="Materials" 
        labelRu="Материалы"
        onClick={() => setLocation('/materials')}
      />
      <NavItem 
        icon={<Zap className="h-5 w-5" />} 
        label="AI Insight" 
        labelRu="AI анализ"
        onClick={() => setLocation('/ai')}
      />
      <NavItem 
        icon={<FlaskRound className="h-5 w-5" />} 
        label="Chemistry" 
        labelRu="Химический состав"
        onClick={() => setLocation('/chemistry')}
      />
      <NavItem 
        icon={<Settings className="h-5 w-5" />} 
        label="Settings" 
        labelRu="Настройки"
        onClick={() => setLocation('/settings')}
      />
    </nav>
  );
}
