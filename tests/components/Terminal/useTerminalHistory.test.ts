import { act, renderHook } from '@testing-library/react';
import { useTerminalHistory } from '@/app/components/Terminal/terminal/hooks/useTerminalHistory';

describe('useTerminalHistory', () => {
	it('adds valid commands to history and deduplicates identical commands', () => {
		const { result } = renderHook(() => useTerminalHistory());

		act(() => {
			result.current.addToHistory('ls');
			result.current.addToHistory('cd portfolio');
			result.current.addToHistory('ls');
		});

		expect(result.current.history).toEqual(['cd portfolio', 'ls']);
	});

	it('ignores very short commands (<= 1 char)', () => {
		const { result } = renderHook(() => useTerminalHistory());

		act(() => {
			result.current.addToHistory('a');
			result.current.addToHistory('');
		});

		expect(result.current.history).toEqual([]);
	});

	it('navigates up and down through history correctly', () => {
		const { result } = renderHook(() => useTerminalHistory());

		act(() => {
			result.current.addToHistory('cmd 1');
			result.current.addToHistory('cmd 2');
			result.current.addToHistory('cmd 3');
		});

		let prev: string | null = null;
		act(() => {
			prev = result.current.navigateUp();
		});
		expect(prev).toBe('cmd 3');

		act(() => {
			prev = result.current.navigateUp();
		});
		expect(prev).toBe('cmd 2');

		act(() => {
			prev = result.current.navigateUp();
		});
		expect(prev).toBe('cmd 1');

		// Clamped at earliest
		act(() => {
			prev = result.current.navigateUp();
		});
		expect(prev).toBe('cmd 1');

		let next: string | null = null;
		act(() => {
			next = result.current.navigateDown();
		});
		expect(next).toBe('cmd 2');

		act(() => {
			next = result.current.navigateDown();
		});
		expect(next).toBe('cmd 3');

		act(() => {
			next = result.current.navigateDown();
		});
		expect(next).toBe('');
	});

	it('resets index on resetIndex', () => {
		const { result } = renderHook(() => useTerminalHistory());

		act(() => {
			result.current.addToHistory('test');
			result.current.navigateUp();
		});

		expect(result.current.historyIndex).toBe(0);

		act(() => {
			result.current.resetIndex();
		});

		expect(result.current.historyIndex).toBe(-1);
	});
});
