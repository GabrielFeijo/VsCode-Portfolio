import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';
import { isBrowser, isMobile } from 'react-device-detect';

export interface LayoutContextValue {
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  toggleExplorer: () => void;
  terminal: boolean;
  setTerminal: React.Dispatch<React.SetStateAction<boolean>>;
  toggleTerminal: () => void;
  ranking: boolean;
  setRanking: React.Dispatch<React.SetStateAction<boolean>>;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function useLayoutContext(): LayoutContextValue {
  const ctx = useContext(LayoutContext);
  if (!ctx) {
    throw new Error('useLayoutContext must be used within a LayoutProvider');
  }
  return ctx;
}

interface LayoutProviderProps {
  children: React.ReactNode;
}

export function LayoutProvider({ children }: LayoutProviderProps) {
  const [expanded, setExpanded] = useState(isBrowser);
  const [terminal, setTerminal] = useState(isBrowser && !isMobile);
  const [ranking, setRanking] = useState(false);

  const toggleExplorer = useCallback(() => setExpanded((v) => !v), []);
  const toggleTerminal = useCallback(
    () => {
      if (isMobile) return;
      setTerminal((v) => !v);
    },
    [],
  );

  const value: LayoutContextValue = {
    expanded,
    setExpanded,
    toggleExplorer,
    terminal,
    setTerminal,
    toggleTerminal,
    ranking,
    setRanking,
  };

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  );
}
