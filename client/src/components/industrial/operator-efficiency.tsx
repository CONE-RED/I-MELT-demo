import { useState, useEffect } from 'react';
import { Command, Keyboard, Zap, Clock, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
}

interface OperatorShortcutsProps {
  shortcuts: KeyboardShortcut[];
  isVisible: boolean;
  onToggle: () => void;
}

export function OperatorShortcuts({ shortcuts, isVisible, onToggle }: OperatorShortcutsProps) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Toggle shortcuts panel with Ctrl/Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onToggle();
        return;
      }

      // Execute shortcuts
      const shortcut = shortcuts.find(s => 
        s.key.toLowerCase() === e.key.toLowerCase() && 
        (e.ctrlKey || e.altKey)
      );
      
      if (shortcut) {
        e.preventDefault();
        shortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [shortcuts, onToggle]);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={onToggle}
          className="bg-cone-red hover:bg-cone-red/80 text-white p-2 rounded-lg shadow-lg"
        >
          <Keyboard className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-cone-black border border-cone-gray/30 rounded-lg p-4 shadow-xl min-w-80">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-cone-white">Operator Shortcuts</h3>
        <button
          onClick={onToggle}
          className="text-cone-gray hover:text-cone-white"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span className="text-cone-gray">{shortcut.description}</span>
            <kbd className="bg-cone-gray/20 px-2 py-1 rounded text-xs font-mono">
              {shortcut.key}
            </kbd>
          </div>
        ))}
      </div>
      
      <div className="mt-3 pt-3 border-t border-cone-gray/20 text-xs text-cone-gray">
        Press <kbd className="bg-cone-gray/20 px-1 rounded">Ctrl+K</kbd> to toggle
      </div>
    </div>
  );
}

interface ContextualActionsProps {
  heatData: any;
  currentStage: string;
}

export function ContextualActions({ heatData, currentStage }: ContextualActionsProps) {
  const getSmartSuggestions = () => {
    if (!heatData) return [];

    const suggestions = [];
    
    // Chemistry-based suggestions
    if (heatData.chemSteel?.C < 0.08) {
      suggestions.push({
        id: 'increase-carbon',
        icon: TrendingUp,
        title: 'Increase Carbon',
        description: 'Add 0.42t carbon to reach target composition',
        priority: 'high',
        action: () => console.log('Apply carbon addition')
      });
    }

    // Energy optimization
    if (heatData.confidence > 90) {
      suggestions.push({
        id: 'optimize-energy',
        icon: Zap,
        title: 'Energy Optimization',
        description: 'Switch to profile 4 to reduce consumption by 8.7%',
        priority: 'medium',
        action: () => console.log('Apply energy optimization')
      });
    }

    // Stage-specific actions
    if (currentStage === 'Melting') {
      suggestions.push({
        id: 'stage-transition',
        icon: Clock,
        title: 'Prepare Next Stage',
        description: 'Ready for refining stage in 5 minutes',
        priority: 'low',
        action: () => console.log('Prepare stage transition')
      });
    }

    return suggestions;
  };

  const suggestions = getSmartSuggestions();

  // Always show at least one suggestion for testing
  if (suggestions.length === 0) {
    suggestions.push({
      id: 'test-suggestion',
      icon: Zap,
      title: 'Test Clear Screen',
      description: 'Click Apply to test the clear screen functionality',
      priority: 'low',
      action: () => {
        console.log('Test action executed');
        alert('Apply button works! Screen should clear now.');
      }
    });
  }

  return (
    <div className="fixed top-20 right-4 z-40 space-y-2">
      {suggestions.map((suggestion) => {
        const Icon = suggestion.icon;
        const priorityColors = {
          high: 'bg-red-500/20 border-red-500/50 text-red-400',
          medium: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
          low: 'bg-blue-500/20 border-blue-500/50 text-blue-400'
        };

        return (
          <div
            key={suggestion.id}
            className={cn(
              "p-3 rounded-lg border backdrop-blur-sm",
              priorityColors[suggestion.priority as keyof typeof priorityColors]
            )}
          >
            <div className="flex items-start gap-3">
              <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{suggestion.title}</div>
                <div className="text-xs opacity-80 mt-1">{suggestion.description}</div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Apply button clicked for:', suggestion.title);
                    alert(`Applied: ${suggestion.title}`);
                    suggestion.action();
                    // Clear the screen after applying
                    window.dispatchEvent(new CustomEvent('clearScreen'));
                  }}
                  className="mt-2 text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface PerformanceMetricsProps {
  metrics: {
    efficiency: number;
    accuracy: number;
    timeToTarget: string;
    energySavings: number;
  };
}

export function PerformanceMetrics({ metrics }: PerformanceMetricsProps) {
  return (
    <div className="bg-cone-gray/10 rounded-lg p-3">
      <h4 className="font-medium text-cone-white mb-3 flex items-center gap-2">
        <Target className="w-4 h-4" />
        Operator Performance
      </h4>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-cone-gray">Process Efficiency</div>
          <div className="text-lg font-bold text-green-400">{metrics.efficiency}%</div>
        </div>
        
        <div>
          <div className="text-cone-gray">Target Accuracy</div>
          <div className="text-lg font-bold text-blue-400">{metrics.accuracy}%</div>
        </div>
        
        <div>
          <div className="text-cone-gray">Time to Target</div>
          <div className="text-lg font-bold text-yellow-400">{metrics.timeToTarget}</div>
        </div>
        
        <div>
          <div className="text-cone-gray">Energy Savings</div>
          <div className="text-lg font-bold text-purple-400">{metrics.energySavings}%</div>
        </div>
      </div>
    </div>
  );
}