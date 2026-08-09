import dayjs from 'dayjs';

const CACHE_KEY = 'home-cache';

export interface HomeCache {
	lastFetch: string;
}

export const CacheService = {
	getCache: (): HomeCache | null => {
		const raw = localStorage.getItem(CACHE_KEY);
		if (!raw) return null;

		try {
			const parsed: unknown = JSON.parse(raw);
			if (
				typeof parsed === 'object' &&
				parsed !== null &&
				typeof (parsed as HomeCache).lastFetch === 'string'
			) {
				return parsed as HomeCache;
			}
		} catch {
			// Invalid cache entries are treated as expired and removed below.
		}

		localStorage.removeItem(CACHE_KEY);
		return null;
	},

	setCache: (cache: HomeCache) => {
		localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
	},

	has24HoursPassed: (): boolean => {
		const cache = CacheService.getCache();
		if (!cache) return true;

		const last = dayjs(cache.lastFetch);
		if (!last.isValid()) return true;
		const now = dayjs();

		return now.diff(last, 'hour') >= 24;
	},
};
