import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  priority?: 'high' | 'medium' | 'low';
}

export function CollapsibleSection({ 
  title, 
  children, 
  defaultOpen = false, 
  className,
  priority = 'medium'
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const priorityStyles = {
    high: 'border-cone-red/30 bg-cone-red/5',
    medium: 'border-cone-gray/30 bg-cone-black',
    low: 'border-cone-gray/20 bg-cone-gray/5'
  };

  return (
    <div className={cn(
      "border rounded-lg overflow-hidden transition-all duration-200",
      priorityStyles[priority],
      className
    )}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-cone-gray/10 transition-colors"
      >
        <span className="font-medium text-cone-white">{title}</span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-cone-gray transition-transform" />
        ) : (
          <ChevronRight className="w-4 h-4 text-cone-gray transition-transform" />
        )}
      </button>
      
      {isOpen && (
        <div className="p-3 border-t border-cone-gray/20 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

interface ProgressiveDetailsProps {
  summary: React.ReactNode;
  details: React.ReactNode;
  expandText?: string;
  collapseText?: string;
}

export function ProgressiveDetails({ 
  summary, 
  details, 
  expandText = "Show details", 
  collapseText = "Hide details" 
}: ProgressiveDetailsProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="space-y-2">
      {summary}
      
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="text-xs text-cone-red hover:text-cone-red/80 transition-colors"
      >
        {showDetails ? collapseText : expandText}
      </button>
      
      {showDetails && (
        <div className="animate-in slide-in-from-top-2 duration-200">
          {details}
        </div>
      )}
    </div>
  );
}