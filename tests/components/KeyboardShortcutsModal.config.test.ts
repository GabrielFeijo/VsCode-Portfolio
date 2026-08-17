import { KEYBOARD_SHORTCUTS } from '../../src/app/components/KeyboardShortcutsModal/keyboardShortcuts.config';

describe('keyboardShortcuts.config', () => {
	it('defines six shortcuts with unique ids', () => {
		expect(KEYBOARD_SHORTCUTS).toHaveLength(6);

		const ids = KEYBOARD_SHORTCUTS.map((shortcut) => shortcut.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('maps each shortcut to translation keys and key chords', () => {
		for (const shortcut of KEYBOARD_SHORTCUTS) {
			expect(shortcut.labelKey.startsWith('shortcuts.')).toBe(true);
			expect(shortcut.keys.length).toBeGreaterThanOrEqual(2);
			expect(shortcut.accent).toBeTruthy();
		}
	});
});
