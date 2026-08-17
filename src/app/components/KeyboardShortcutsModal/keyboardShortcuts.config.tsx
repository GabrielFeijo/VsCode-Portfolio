import { IconType } from 'react-icons';
import {
	VscTerminal,
	VscColorMode,
	VscGlobe,
	VscEditorLayout,
	VscHome,
	VscSave,
} from 'react-icons/vsc';

export type ShortcutAccent = 'green' | 'blue' | 'cyan' | 'yellow' | 'mauve' | 'peach';

export interface KeyboardShortcut {
	id: string;
	Icon: IconType;
	keys: readonly string[];
	accent: ShortcutAccent;
	labelKey: string;
}

export const KEYBOARD_SHORTCUTS = [
	{
		id: 'terminal',
		Icon: VscTerminal,
		keys: ['Ctrl', 'J'],
		accent: 'green',
		labelKey: 'shortcuts.terminal',
	},
	{
		id: 'theme',
		Icon: VscColorMode,
		keys: ['Ctrl', 'D'],
		accent: 'yellow',
		labelKey: 'shortcuts.theme',
	},
	{
		id: 'language',
		Icon: VscGlobe,
		keys: ['Ctrl', 'L'],
		accent: 'cyan',
		labelKey: 'shortcuts.language',
	},
	{
		id: 'sidebar',
		Icon: VscEditorLayout,
		keys: ['Ctrl', 'B'],
		accent: 'blue',
		labelKey: 'shortcuts.sidebar',
	},
	{
		id: 'home',
		Icon: VscHome,
		keys: ['Ctrl', 'H'],
		accent: 'mauve',
		labelKey: 'shortcuts.home',
	},
	{
		id: 'save',
		Icon: VscSave,
		keys: ['Ctrl', 'S'],
		accent: 'peach',
		labelKey: 'shortcuts.save',
	},
] as const satisfies readonly KeyboardShortcut[];

