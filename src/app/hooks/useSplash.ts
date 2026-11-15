import { useEffect, useState } from 'react';

export const SPLASH_MAX_DURATION_MS = 1000;

export function useSplashVisible(settled: boolean, maxMs = SPLASH_MAX_DURATION_MS): boolean {
	const [expired, setExpired] = useState(false);

	useEffect(() => {
		if (settled) return;
		const timer = setTimeout(() => setExpired(true), maxMs);
		return () => clearTimeout(timer);
	}, [maxMs, settled]);

	return !settled && !expired;
}
