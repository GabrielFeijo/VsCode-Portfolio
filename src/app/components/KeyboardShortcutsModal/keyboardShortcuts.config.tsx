import { ReactNode } from 'react';
import {
	VscTerminal,
	VscColorMode,
	VscGlobe,
	VscEditorLayout,
	VscHome,
	VscSave,
} from 'react-icons/vsc';
import styles from './KeyboardShortcutsModal.module.css';

export type ShortcutAccent = 'green' | 'blue' | 'cyan' | 'yellow' | 'mauve' | 'peach';

export interface KeyboardShortcut {
	id: string;
	icon: ReactNode;
	keys: string[];
	accent: ShortcutAccent;
	labelKey: string;
}

export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
	{
		id: 'terminal',
		icon: <VscTerminal className={styles.icon} />,
		keys: ['Ctrl', 'J'],
		accent: 'green',
		labelKey: 'shortcuts.terminal',
	},
	{
		id: 'theme',
		icon: <VscColorMode className={styles.icon} />,
		keys: ['Ctrl', 'D'],
		accent: 'yellow',
		labelKey: 'shortcuts.theme',
	},
	{
		id: 'language',
		icon: <VscGlobe className={styles.icon} />,
		keys: ['Ctrl', 'L'],
		accent: 'cyan',
		labelKey: 'shortcuts.language',
	},
	{
		id: 'sidebar',
		icon: <VscEditorLayout className={styles.icon} />,
		keys: ['Ctrl', 'B'],
		accent: 'blue',
		labelKey: 'shortcuts.sidebar',
	},
	{
		id: 'home',
		icon: <VscHome className={styles.icon} />,
		keys: ['Ctrl', 'H'],
		accent: 'mauve',
		labelKey: 'shortcuts.home',
	},
	{
		id: 'save',
		icon: <VscSave className={styles.icon} />,
		keys: ['Ctrl', 'S'],
		accent: 'peach',
		labelKey: 'shortcuts.save',
	},
];
