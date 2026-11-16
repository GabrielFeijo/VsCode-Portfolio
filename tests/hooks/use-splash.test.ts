import { act, renderHook } from '@testing-library/react';
import { SPLASH_MAX_DURATION_MS, useSplashVisible } from '../../src/app/hooks/use-splash';

describe('useSplashVisible', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('hides immediately when already settled', () => {
		const { result } = renderHook(() => useSplashVisible(true));
		expect(result.current).toBe(false);
	});

	it('hides as soon as the warm-up settles before the timeout', () => {
		const { result, rerender } = renderHook(({ settled }) => useSplashVisible(settled), {
			initialProps: { settled: false },
		});

		expect(result.current).toBe(true);
		rerender({ settled: true });
		expect(result.current).toBe(false);
	});

	it('never blocks longer than the maximum splash duration when the API is slow', () => {
		const { result } = renderHook(() => useSplashVisible(false, 800));

		expect(result.current).toBe(true);

		act(() => {
			jest.advanceTimersByTime(799);
		});
		expect(result.current).toBe(true);

		act(() => {
			jest.advanceTimersByTime(1);
		});
		expect(result.current).toBe(false);
		expect(SPLASH_MAX_DURATION_MS).toBe(1000);
	});
});
