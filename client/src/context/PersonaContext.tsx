/**
 * PersonaContext.tsx
 * Global persona state management for the entire application
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export type PersonaType = 'operator' | 'metallurgist' | 'manager' | 'cfo';

interface PersonaContextType {
  currentPersona: PersonaType;
  setPersona: (persona: PersonaType) => void;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

interface PersonaProviderProps {
  children: React.ReactNode;
}

export function PersonaProvider({ children }: PersonaProviderProps) {
  const [currentPersona, setCurrentPersona] = useState<PersonaType>('operator');

  // Load persona from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('i-melt-persona');
      if (saved && ['operator', 'metallurgist', 'manager', 'cfo'].includes(saved)) {
        setCurrentPersona(saved as PersonaType);
      }
    } catch (error) {
      console.warn('Failed to load persona from localStorage:', error);
    }
  }, []);

  // Save persona to localStorage when changed
  const setPersona = (persona: PersonaType) => {
    setCurrentPersona(persona);
    try {
      localStorage.setItem('i-melt-persona', persona);
    } catch (error) {
      console.warn('Failed to save persona to localStorage:', error);
    }
  };

  return (
    <PersonaContext.Provider value={{ currentPersona, setPersona }}>
      {children}
    </PersonaContext.Provider>
  );
}

export function useGlobalPersona() {
  const context = useContext(PersonaContext);
  if (context === undefined) {
    throw new Error('useGlobalPersona must be used within a PersonaProvider');
  }
  return context;
}