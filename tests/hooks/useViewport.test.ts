import { act, renderHook } from '@testing-library/react';
import { getViewportState, matchesMediaQuery, useViewport } from '../../src/app/hooks/useViewport';

const mockDeviceDetect = {
	isMobile: false,
	isBrowser: true,
};

jest.mock('react-device-detect', () => ({
	get isMobile() {
		return mockDeviceDetect.isMobile;
	},
	get isBrowser() {
		return mockDeviceDetect.isBrowser;
	},
}));

describe('useViewport', () => {
	const originalMatchMedia = window.matchMedia;

	beforeEach(() => {
		mockDeviceDetect.isMobile = false;
		mockDeviceDetect.isBrowser = true;
		Object.defineProperty(window, 'matchMedia', {
			configurable: true,
			writable: true,
			value: undefined,
		});
	});

	afterAll(() => {
		Object.defineProperty(window, 'matchMedia', {
			configurable: true,
			writable: true,
			value: originalMatchMedia,
		});
	});

	it('returns false from matchesMediaQuery when matchMedia is unavailable', () => {
		expect(matchesMediaQuery('(max-width: 767px)')).toBe(false);
	});

	it('detects desktop when matchMedia is unavailable and device is browser', () => {
		expect(getViewportState()).toEqual({
			isMobile: false,
			isTablet: false,
			isCompact: false,
			isDesktop: true,
		});
	});

	it('detects mobile when react-device-detect reports mobile', () => {
		mockDeviceDetect.isMobile = true;
		expect(getViewportState()).toEqual({
			isMobile: true,
			isTablet: false,
			isCompact: true,
			isDesktop: false,
		});
	});

	it('detects tablet and reacts to matchMedia change events', () => {
		const listeners: Array<() => void> = [];
		let isMobileMatches = false;
		let isTabletMatches = true;

		Object.defineProperty(window, 'matchMedia', {
			configurable: true,
			writable: true,
			value: jest.fn((query: string) => ({
				matches:
					query.includes('767px') && !query.includes('min-width')
						? isMobileMatches
						: isTabletMatches,
				media: query,
				addEventListener: (_event: string, cb: () => void) => listeners.push(cb),
				removeEventListener: jest.fn(),
			})),
		});

		const { result, unmount } = renderHook(() => useViewport());

		expect(result.current).toEqual({
			isMobile: false,
			isTablet: true,
			isCompact: true,
			isDesktop: false,
		});

		act(() => {
			isMobileMatches = true;
			isTabletMatches = false;
			for (const listener of listeners) {
				listener();
			}
		});

		expect(result.current).toEqual({
			isMobile: true,
			isTablet: false,
			isCompact: true,
			isDesktop: false,
		});

		unmount();
	});
});
