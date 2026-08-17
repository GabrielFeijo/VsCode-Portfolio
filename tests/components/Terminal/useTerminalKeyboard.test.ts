import { renderHook, act } from '@testing-library/react';
import { useRef } from 'react';
import { useTerminalKeyboard } from '@/app/components/Terminal/terminal/hooks/useTerminalKeyboard';
import { VirtualDirectory } from '@/app/components/Terminal/terminal/types';

const fs: VirtualDirectory = {
	'/home': [{ name: 'portfolio', type: 'dir' }],
	'/home/portfolio': [
		{ name: 'README.md', type: 'file', content: ['# Hello'] },
	],
};

function createKeyboardEvent(
	key: string,
	options: Partial<React.KeyboardEvent> = {},
): React.KeyboardEvent<HTMLTextAreaElement> {
	return {
		key,
		ctrlKey: false,
		preventDefault: jest.fn(),
		stopPropagation: jest.fn(),
		...options,
	} as unknown as React.KeyboardEvent<HTMLTextAreaElement>;
}

describe('useTerminalKeyboard', () => {
	const allCommands = ['ls', 'cd', 'pwd', 'cat', 'help'];
	const cwd = '/home';
	let commandRef: React.MutableRefObject<string>;

	const buildHook = (command = '') => {
		const setCommand = jest.fn();
		const clearEntries = jest.fn();
		const addEntry = jest.fn();
		const navigateUp = jest.fn().mockReturnValue(null);
		const navigateDown = jest.fn().mockReturnValue(null);

		const { result } = renderHook(() => {
			commandRef = useRef(command);
			return useTerminalKeyboard({
				command,
				cwd,
				allCommands,
				fs,
				commandRef,
				setCommand,
				clearEntries,
				addEntry,
				navigateUp,
				navigateDown,
			});
		});

		return { result, setCommand, clearEntries, addEntry, navigateUp, navigateDown };
	};

	it('Ctrl+L clears entries', () => {
		const { result, clearEntries } = buildHook();
		const event = createKeyboardEvent('l', { ctrlKey: true });

		act(() => {
			result.current.handleKeyDown(event);
		});

		expect(event.preventDefault).toHaveBeenCalled();
		expect(clearEntries).toHaveBeenCalled();
	});

	it('ArrowUp navigates history', () => {
		const { result, navigateUp, setCommand } = buildHook();
		(navigateUp as jest.Mock).mockReturnValue('ls');
		const event = createKeyboardEvent('ArrowUp');

		act(() => {
			result.current.handleKeyDown(event);
		});

		expect(event.preventDefault).toHaveBeenCalled();
		expect(navigateUp).toHaveBeenCalled();
		expect(setCommand).toHaveBeenCalledWith('ls');
	});

	it('ArrowDown navigates history', () => {
		const { result, navigateDown, setCommand } = buildHook();
		(navigateDown as jest.Mock).mockReturnValue('pwd');
		const event = createKeyboardEvent('ArrowDown');

		act(() => {
			result.current.handleKeyDown(event);
		});

		expect(event.preventDefault).toHaveBeenCalled();
		expect(navigateDown).toHaveBeenCalled();
		expect(setCommand).toHaveBeenCalledWith('pwd');
	});

	it('ArrowUp with no history does not set command', () => {
		const { result, navigateUp, setCommand } = buildHook();
		(navigateUp as jest.Mock).mockReturnValue(null);
		const event = createKeyboardEvent('ArrowUp');

		act(() => {
			result.current.handleKeyDown(event);
		});

		expect(setCommand).not.toHaveBeenCalled();
	});

	it('Tab with single match completes the command', () => {
		const { result, setCommand } = buildHook('pw');
		const event = createKeyboardEvent('Tab');

		act(() => {
			result.current.handleKeyDown(event);
		});

		expect(event.preventDefault).toHaveBeenCalled();
		expect(setCommand).toHaveBeenCalledWith('pwd ');
	});

	it('Tab with multiple matches shows candidates', () => {
		const { result, addEntry } = buildHook('c');
		const event = createKeyboardEvent('Tab');

		act(() => {
			result.current.handleKeyDown(event);
		});

		expect(event.preventDefault).toHaveBeenCalled();
		expect(addEntry).toHaveBeenCalledWith('c <TAB>', expect.any(Array));
	});

	it('stopPropagation is always called', () => {
		const { result } = buildHook();
		const event = createKeyboardEvent('Enter');

		act(() => {
			result.current.handleKeyDown(event);
		});

		expect(event.stopPropagation).toHaveBeenCalled();
	});
});
