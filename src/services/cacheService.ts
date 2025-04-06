import dayjs from 'dayjs';

const CACHE_KEY = 'home-cache';

export interface HomeCache {
	lastFetch: string;
}

export const CacheService = {
	getCache: (): HomeCache | null => {
		const raw = localStorage.getItem(CACHE_KEY);
		return raw ? JSON.parse(raw) : null;
	},

	setCache: (cache: HomeCache) => {
		localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
	},

	has24HoursPassed: (): boolean => {
		const cache = CacheService.getCache();
		if (!cache) return true;

		const last = dayjs(cache.lastFetch);
		const now = dayjs();

		return now.diff(last, 'hour') >= 24;
	},
};
