import { useEffect, useState } from 'react';
import { isBrowser, isMobile as isDeviceMobile } from 'react-device-detect';
import { BREAKPOINTS } from '../../constants/layout';

export interface ViewportState {
	isMobile: boolean;
	isTablet: boolean;
	isCompact: boolean;
	isDesktop: boolean;
}

export function matchesMediaQuery(query: string): boolean {
	if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
		return false;
	}
	return window.matchMedia(query).matches;
}

export function getViewportState(): ViewportState {
	const mobileQuery = matchesMediaQuery(`(max-width: ${BREAKPOINTS.MOBILE_MAX}px)`);
	const tabletQuery = matchesMediaQuery(
		`(min-width: ${BREAKPOINTS.MOBILE_MAX + 1}px) and (max-width: ${BREAKPOINTS.TABLET_MAX}px)`,
	);

	const isMobile = isDeviceMobile || !isBrowser || mobileQuery;
	const isTablet = !isMobile && tabletQuery;
	const isCompact = isMobile || isTablet;

	return {
		isMobile,
		isTablet,
		isCompact,
		isDesktop: !isCompact,
	};
}

export function useViewport(): ViewportState {
	const [viewport, setViewport] = useState<ViewportState>(getViewportState);

	useEffect(() => {
		if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

		const mobileMql = window.matchMedia(`(max-width: ${BREAKPOINTS.MOBILE_MAX}px)`);
		const tabletMql = window.matchMedia(
			`(min-width: ${BREAKPOINTS.MOBILE_MAX + 1}px) and (max-width: ${BREAKPOINTS.TABLET_MAX}px)`,
		);

		const syncViewport = () => setViewport(getViewportState());

		mobileMql.addEventListener?.('change', syncViewport);
		tabletMql.addEventListener?.('change', syncViewport);

		return () => {
			mobileMql.removeEventListener?.('change', syncViewport);
			tabletMql.removeEventListener?.('change', syncViewport);
		};
	}, []);

	return viewport;
}
