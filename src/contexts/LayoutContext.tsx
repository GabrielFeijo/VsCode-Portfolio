import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { isBrowser } from 'react-device-detect';
import { matchesMediaQuery, useViewport } from '../app/hooks/useViewport';
import { BREAKPOINTS } from '../constants/layout';

export interface LayoutContextValue {
	expanded: boolean;
	setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
	toggleExplorer: () => void;
	terminal: boolean;
	setTerminal: React.Dispatch<React.SetStateAction<boolean>>;
	toggleTerminal: () => void;
	ranking: boolean;
	setRanking: React.Dispatch<React.SetStateAction<boolean>>;
	isMobile: boolean;
	isTablet: boolean;
	isCompact: boolean;
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
	const { isMobile, isTablet, isCompact } = useViewport();
	const isCompactMedia = matchesMediaQuery(`(max-width: ${BREAKPOINTS.TABLET_MAX}px)`);
	const [expanded, setExpanded] = useState(() => isBrowser && !isCompactMedia);
	const [terminal, setTerminal] = useState(() => isBrowser && !isMobile);
	const [ranking, setRanking] = useState(false);

	useEffect(() => {
		if (isCompactMedia) {
			setExpanded(false);
		}
	}, [isCompactMedia]);

	useEffect(() => {
		if (isMobile) {
			setTerminal(false);
		}
	}, [isMobile]);

	const toggleExplorer = useCallback(() => setExpanded((v) => !v), []);
	const toggleTerminal = useCallback(() => {
		if (isMobile) return;
		setTerminal((v) => !v);
	}, [isMobile]);

	const value: LayoutContextValue = {
		expanded,
		setExpanded,
		toggleExplorer,
		terminal,
		setTerminal,
		toggleTerminal,
		ranking,
		setRanking,
		isMobile,
		isTablet,
		isCompact,
	};

	return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}
