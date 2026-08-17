import { renderHook, act } from '@testing-library/react';
import { useTerminalEntries } from '@/app/components/Terminal/terminal/hooks/useTerminalEntries';

describe('useTerminalEntries', () => {
	it('starts with empty entries', () => {
		const { result } = renderHook(() => useTerminalEntries('/home'));
		expect(result.current.entries).toEqual([]);
	});

	it('adds entries and each has a unique id', () => {
		const { result } = renderHook(() => useTerminalEntries('/home'));

		act(() => {
			result.current.addEntry('ls', ['file.txt']);
			result.current.addEntry('pwd', ['/home']);
		});

		expect(result.current.entries).toHaveLength(2);
		expect(result.current.entries[0].id).not.toBe(result.current.entries[1].id);
		expect(result.current.entries[0].command).toBe('ls');
		expect(result.current.entries[1].command).toBe('pwd');
	});

	it('uses the hook cwd when none is given to addEntry', () => {
		const { result } = renderHook(() => useTerminalEntries('/home/gabriel'));

		act(() => {
			result.current.addEntry('ls', []);
		});

		expect(result.current.entries[0].cwd).toBe('/home/gabriel');
	});

	it('uses the override cwd when explicitly provided', () => {
		const { result } = renderHook(() => useTerminalEntries('/home'));

		act(() => {
			result.current.addEntry('ls', [], undefined, '/tmp');
		});

		expect(result.current.entries[0].cwd).toBe('/tmp');
	});

	it('stores color on entry when provided', () => {
		const { result } = renderHook(() => useTerminalEntries('/home'));

		act(() => {
			result.current.addEntry('ls', [], '#ff0000');
		});

		expect(result.current.entries[0].color).toBe('#ff0000');
	});

	it('clears all entries', () => {
		const { result } = renderHook(() => useTerminalEntries('/home'));

		act(() => {
			result.current.addEntry('ls', ['a']);
			result.current.addEntry('pwd', ['/home']);
		});

		expect(result.current.entries).toHaveLength(2);

		act(() => {
			result.current.clearEntries();
		});

		expect(result.current.entries).toHaveLength(0);
	});
});
