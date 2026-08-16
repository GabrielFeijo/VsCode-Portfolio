import { renderHook } from '@testing-library/react';
import { useAppKeyboardShortcuts } from '../../src/app/hooks/useAppKeyboardShortcuts';

function createActions(terminalEnabled = true) {
	return {
		changeLanguage: jest.fn(),
		navigateHome: jest.fn(),
		toggleExplorer: jest.fn(),
		toggleTerminal: jest.fn(),
		toggleTheme: jest.fn(),
		terminalEnabled,
	};
}

function pressKey(key: string, ctrlKey = true) {
	const event = new KeyboardEvent('keydown', {
		key,
		ctrlKey,
		cancelable: true,
	});
	window.dispatchEvent(event);
	return event;
}

describe('useAppKeyboardShortcuts', () => {
	it.each([
		['b', 'toggleExplorer'],
		['d', 'toggleTheme'],
		['h', 'navigateHome'],
		['l', 'changeLanguage'],
		['j', 'toggleTerminal'],
	] as const)('runs Ctrl+%s through %s', (key, action) => {
		const actions = createActions();
		renderHook(() => useAppKeyboardShortcuts(actions));

		const event = pressKey(key.toUpperCase());

		expect(actions[action]).toHaveBeenCalledTimes(1);
		expect(event.defaultPrevented).toBe(true);
	});

	it('ignores keys without Ctrl and shortcuts without an action', () => {
		const actions = createActions(false);
		renderHook(() => useAppKeyboardShortcuts(actions));

		const plainKey = pressKey('b', false);
		const unknownShortcut = pressKey('x');
		const disabledTerminal = pressKey('j');

		expect(plainKey.defaultPrevented).toBe(false);
		expect(unknownShortcut.defaultPrevented).toBe(false);
		expect(disabledTerminal.defaultPrevented).toBe(false);
		expect(actions.toggleExplorer).not.toHaveBeenCalled();
		expect(actions.toggleTerminal).not.toHaveBeenCalled();
	});

	it('ignores shortcuts when target is an input or textarea element', () => {
		const actions = createActions();
		renderHook(() => useAppKeyboardShortcuts(actions));

		const input = document.createElement('input');
		document.body.appendChild(input);

		const event = new KeyboardEvent('keydown', {
			key: 'l',
			ctrlKey: true,
			cancelable: true,
			bubbles: true,
		});
		input.dispatchEvent(event);

		expect(actions.changeLanguage).not.toHaveBeenCalled();
		expect(event.defaultPrevented).toBe(false);
		document.body.removeChild(input);
	});

	it('removes its keyboard listener on unmount', () => {
		const actions = createActions();
		const { unmount } = renderHook(() => useAppKeyboardShortcuts(actions));

		unmount();
		pressKey('b');

		expect(actions.toggleExplorer).not.toHaveBeenCalled();
	});
});
