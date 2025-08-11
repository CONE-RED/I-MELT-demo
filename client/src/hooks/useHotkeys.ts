import { useEffect } from "react";

export type HotkeyMap = Record<string, () => void>;

export const useHotkeys = (map: HotkeyMap) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if not in input fields
      const target = e.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' || 
                          target.tagName === 'TEXTAREA' || 
                          target.contentEditable === 'true';
      
      if (isInputField) return;
      
      const handler = map[e.key];
      if (handler) {
        e.preventDefault();
        handler();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [map]);
};

// Predefined hotkey combinations for demo scenarios
export const DEMO_HOTKEYS = {
  '1': 'energy-spike',
  '2': 'foam-collapse', 
  '3': 'temp-risk',
  'r': 'apply-recovery',
  'R': 'apply-recovery',
  '?': 'show-help'
} as const;

export type DemoScenario = keyof typeof DEMO_HOTKEYS;