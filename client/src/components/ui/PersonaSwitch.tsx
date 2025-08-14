/**
 * PersonaSwitch.tsx
 * Phase 4: Persona toggle for stakeholder-specific views
 * 
 * Transforms the interface from operator signals to CFO financials in one click
 */

import React, { useState, useEffect } from 'react';
import { Settings, User, TrendingUp, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type PersonaType = 'operator' | 'metallurgist' | 'manager' | 'cfo';

export interface PersonaConfig {
  id: PersonaType;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  focus: string[];
  hiddenSections?: string[];
}

const PERSONAS: PersonaConfig[] = [
  {
    id: 'operator',
    name: 'Operator',
    description: 'Focus on process signals and immediate actions',
    icon: <Settings className="w-4 h-4" />,
    color: 'bg-blue-500 text-white',
    focus: ['Power signals', 'Foaming alerts', 'Temperature control', 'Action buttons'],
    hiddenSections: ['roi-card', 'sync-guard-euros']
  },
  {
    id: 'metallurgist', 
    name: 'Metallurgist',
    description: 'Focus on chemistry and temperature control',
    icon: <User className="w-4 h-4" />,
    color: 'bg-purple-500 text-white',
    focus: ['Temperature bands', 'Chemistry analysis', 'Steel grade targets', 'Process optimization'],
    hiddenSections: ['sync-guard-euros']
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Focus on KPIs and operational efficiency',
    icon: <TrendingUp className="w-4 h-4" />,
    color: 'bg-green-500 text-white',
    focus: ['KPI dashboards', 'Efficiency metrics', 'Process timeline', 'Performance trends'],
    hiddenSections: []
  },
  {
    id: 'cfo',
    name: 'CFO',
    description: 'Focus on financial impact and ROI',
    icon: <DollarSign className="w-4 h-4" />,
    color: 'bg-orange-500 text-white',
    focus: ['ROI calculations', 'Cost savings', 'Sync Guard €€€', 'Financial reports'],
    hiddenSections: ['power-signals', 'foaming-signals']
  }
];

interface PersonaSwitchProps {
  currentPersona: PersonaType;
  onPersonaChange: (persona: PersonaType) => void;
  className?: string;
  compact?: boolean;
}

export default function PersonaSwitch({
  currentPersona,
  onPersonaChange,
  className,
  compact = false
}: PersonaSwitchProps) {
  const currentConfig = PERSONAS.find(p => p.id === currentPersona) || PERSONAS[0];
  
  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Select value={currentPersona} onValueChange={(value) => onPersonaChange(value as PersonaType)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERSONAS.map((persona) => (
              <SelectItem key={persona.id} value={persona.id}>
                <div className="flex items-center gap-2">
                  {persona.icon}
                  <span>{persona.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Badge variant="outline" className="text-xs">
          {currentConfig.description}
        </Badge>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 p-4 shadow-sm", className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">View As</h3>
        <Badge 
          variant="secondary" 
          className={cn("text-xs", currentConfig.color)}
        >
          {currentConfig.name}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {PERSONAS.map((persona) => {
          const isActive = persona.id === currentPersona;
          
          return (
            <Button
              key={persona.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onPersonaChange(persona.id)}
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-3 px-2 text-xs",
                isActive && persona.color
              )}
            >
              {persona.icon}
              <span className="font-medium">{persona.name}</span>
            </Button>
          );
        })}
      </div>
      
      {/* Current persona focus */}
      <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
        <div className="font-medium text-gray-700 mb-1">{currentConfig.description}</div>
        <div className="text-gray-600">
          Focuses on: {currentConfig.focus.join(', ')}
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to manage persona state with localStorage persistence
 */
export function usePersona(defaultPersona: PersonaType = 'operator') {
  const [currentPersona, setCurrentPersona] = useState<PersonaType>(defaultPersona);

  // Load persona from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('i-melt-persona');
      if (saved && PERSONAS.some(p => p.id === saved)) {
        setCurrentPersona(saved as PersonaType);
      }
    } catch (error) {
      console.warn('Failed to load persona from localStorage:', error);
    }
  }, []);

  // Save persona to localStorage when changed
  const changePersona = (persona: PersonaType) => {
    setCurrentPersona(persona);
    try {
      localStorage.setItem('i-melt-persona', persona);
    } catch (error) {
      console.warn('Failed to save persona to localStorage:', error);
    }
  };

  // Get current persona config
  const personaConfig = PERSONAS.find(p => p.id === currentPersona) || PERSONAS[0];

  // Check if a section should be hidden for current persona
  const isSectionHidden = (sectionId: string): boolean => {
    return personaConfig.hiddenSections?.includes(sectionId) || false;
  };

  // Check if current persona should see a specific element
  const shouldShow = (element: string): boolean => {
    return !isSectionHidden(element);
  };

  return {
    currentPersona,
    changePersona,
    personaConfig,
    isSectionHidden,
    shouldShow,
    personas: PERSONAS
  };
}

/**
 * Higher-order component for persona-conditional rendering
 */
interface PersonaConditionalProps {
  persona?: PersonaType | PersonaType[];
  exclude?: PersonaType | PersonaType[];
  children: React.ReactNode;
  currentPersona: PersonaType;
}

export function PersonaConditional({
  persona,
  exclude,
  children,
  currentPersona
}: PersonaConditionalProps) {
  const shouldRender = () => {
    // If persona is specified, only show for those personas
    if (persona) {
      const allowedPersonas = Array.isArray(persona) ? persona : [persona];
      if (!allowedPersonas.includes(currentPersona)) {
        return false;
      }
    }
    
    // If exclude is specified, hide for those personas
    if (exclude) {
      const excludedPersonas = Array.isArray(exclude) ? exclude : [exclude];
      if (excludedPersonas.includes(currentPersona)) {
        return false;
      }
    }
    
    return true;
  };

  return shouldRender() ? <>{children}</> : null;
}

/**
 * Persona-specific copy/tooltip configurations
 */
export const PERSONA_COPY = {
  operator: {
    power: {
      title: "Power Level",
      tooltip: "Current electrical power consumption and stability indicators"
    },
    foam: {
      title: "Foam Status", 
      tooltip: "Slag foam level protecting electrodes from radiation damage"
    },
    temperature: {
      title: "Temperature",
      tooltip: "Steel temperature for optimal tapping conditions"
    }
  },
  metallurgist: {
    power: {
      title: "Power Efficiency",
      tooltip: "Energy consumption vs. theoretical minimum for current chemistry"
    },
    foam: {
      title: "Foam Index",
      tooltip: "Foam stability indicator affecting temperature homogeneity"
    },
    temperature: {
      title: "Temperature Control",
      tooltip: "Steel temperature with ±5°C control band for grade compliance"
    }
  },
  manager: {
    power: {
      title: "Energy KPI",
      tooltip: "Power consumption vs. monthly targets and benchmarks"
    },
    foam: {
      title: "Process Efficiency",
      tooltip: "Foam management impact on overall furnace productivity"
    },
    temperature: {
      title: "Quality Control",
      tooltip: "Temperature management for consistent steel quality delivery"
    }
  },
  cfo: {
    power: {
      title: "Energy Cost",
      tooltip: "Real-time energy costs and optimization savings potential"
    },
    foam: {
      title: "Electrode Cost",
      tooltip: "Electrode consumption cost and foam protection value"
    },
    temperature: {
      title: "Quality Cost",
      tooltip: "Temperature control impact on rejection costs and rework"
    }
  }
};