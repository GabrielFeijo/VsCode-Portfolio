import { CacheService } from '../../src/services/cacheService';
import dayjs from 'dayjs';

describe('CacheService', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.restoreAllMocks();
    });

    it('getCache returns null when no cache', () => {
        expect(CacheService.getCache()).toBeNull();
    });

    it('setCache stores and getCache returns parsed object', () => {
        const cache = { lastFetch: dayjs().toISOString() };
        CacheService.setCache(cache);
        expect(CacheService.getCache()).toEqual(cache);
    });

    it('has24HoursPassed returns true when no cache', () => {
        expect(CacheService.has24HoursPassed()).toBe(true);
    });

    it('has24HoursPassed returns true when lastFetch older than 24 hours', () => {
        const old = dayjs().subtract(25, 'hour').toISOString();
        CacheService.setCache({ lastFetch: old });
        expect(CacheService.has24HoursPassed()).toBe(true);
    });

    it('has24HoursPassed returns false when lastFetch within 24 hours', () => {
        const recent = dayjs().subtract(5, 'hour').toISOString();
        CacheService.setCache({ lastFetch: recent });
        expect(CacheService.has24HoursPassed()).toBe(false);
    });
});
