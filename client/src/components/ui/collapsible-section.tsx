import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  className?: string;
}

export function CollapsibleSection({ 
  title, 
  children, 
  defaultOpen = true, 
  priority = 'medium',
  className 
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const priorityColors = {
    critical: 'text-red-500 border-red-500/20',
    high: 'text-cone-red border-cone-red/20',
    medium: 'text-cone-white border-cone-gray/20',
    low: 'text-cone-gray border-cone-gray/10'
  };

  return (
    <div className={cn('border rounded-lg', priorityColors[priority], className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-cone-gray/10 transition-colors"
      >
        <span className="font-medium">{title}</span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>
      
      {isOpen && (
        <div className="p-3 pt-0 border-t border-cone-gray/20">
          {children}
        </div>
      )}
    </div>
  );
}

interface ProgressiveDetailsProps {
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  tertiary?: React.ReactNode;
  collapsible?: boolean;
}

export function ProgressiveDetails({ 
  primary, 
  secondary, 
  tertiary, 
  collapsible = true 
}: ProgressiveDetailsProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (!collapsible) {
    return (
      <div className="space-y-2">
        <div className="text-lg font-semibold">{primary}</div>
        {secondary && <div className="text-sm text-cone-gray">{secondary}</div>}
        {tertiary && <div className="text-xs text-cone-gray/70">{tertiary}</div>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-lg font-semibold">{primary}</div>
      
      {(secondary || tertiary) && (
        <>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-cone-red hover:text-cone-white transition-colors"
          >
            {showDetails ? 'Show less' : 'Show details'}
          </button>
          
          {showDetails && (
            <div className="space-y-1 animate-in slide-in-from-top-2">
              {secondary && <div className="text-sm text-cone-gray">{secondary}</div>}
              {tertiary && <div className="text-xs text-cone-gray/70">{tertiary}</div>}
            </div>
          )}
        </>
      )}
    </div>
  );
}