import { cn } from '@/lib/utils';

interface PriorityCardProps {
  children: React.ReactNode;
  priority: 'critical' | 'high' | 'medium' | 'low';
  className?: string;
}

export function PriorityCard({ children, priority, className }: PriorityCardProps) {
  const priorityStyles = {
    critical: 'ring-2 ring-red-500/50 shadow-red-500/20 shadow-lg',
    high: 'ring-1 ring-cone-red/50 shadow-cone-red/10 shadow-md',
    medium: 'ring-1 ring-cone-gray/30 shadow-sm',
    low: 'ring-1 ring-cone-gray/20'
  };

  return (
    <div className={cn(
      "dashboard-card transition-all duration-200",
      priorityStyles[priority],
      className
    )}>
      {children}
    </div>
  );
}

interface InformationLayerProps {
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  tertiary?: React.ReactNode;
  layout?: 'vertical' | 'horizontal';
}

export function InformationLayer({ 
  primary, 
  secondary, 
  tertiary, 
  layout = 'vertical' 
}: InformationLayerProps) {
  return (
    <div className={cn(
      "space-y-4",
      layout === 'horizontal' && "flex items-start space-y-0 space-x-4"
    )}>
      {/* Primary Information - Largest, most prominent */}
      <div className="text-lg font-bold text-cone-white">
        {primary}
      </div>
      
      {/* Secondary Information - Medium size, important but not critical */}
      {secondary && (
        <div className="text-sm font-medium text-cone-gray">
          {secondary}
        </div>
      )}
      
      {/* Tertiary Information - Smallest, contextual details */}
      {tertiary && (
        <div className="text-xs text-cone-gray/70">
          {tertiary}
        </div>
      )}
    </div>
  );
}

interface SmartGridProps {
  children: React.ReactNode;
  isMobile?: boolean;
  emphasizeFirst?: boolean;
}

export function SmartGrid({ children, isMobile = false, emphasizeFirst = false }: SmartGridProps) {
  return (
    <div className={cn(
      "grid gap-3",
      isMobile ? "grid-cols-1" : "grid-cols-12",
      emphasizeFirst && "first:ring-2 first:ring-cone-red/50"
    )}>
      {children}
    </div>
  );
}