import { Language } from '@/domain/page';
import { ActiveEditorSession, TerminalColors, VirtualDirectory } from '../types';

export interface CommandExecutionContext {
	language: Language;
	cwd: string;
	setCwd: (cwd: string) => void;
	previousCwd: string;
	setPreviousCwd: (cwd: string) => void;
	addEntry: (cmd: string, response: string[], color?: string, entryCwd?: string) => void;
	clearEntries: () => void;
	history: string[];
	toggleTheme: () => void;
	changeLanguage: () => void;
	setRanking: React.Dispatch<React.SetStateAction<boolean>>;
	navigate: (path: string) => void;
	terminalColors: TerminalColors;
	t: (key: string, opts?: Record<string, unknown>) => string;
	sessionStart: number;
	isDark: boolean;
	fs: VirtualDirectory;
	setFs: React.Dispatch<React.SetStateAction<VirtualDirectory>>;
	apiCommandList?: string[];
	openEditor?: (session: ActiveEditorSession) => void;
}

export interface ICommandDefinition {
	name: string;
	aliases?: string[];
	description?: string;
	execute: (
		arg: string,
		ctx: CommandExecutionContext,
		rawCommand: string,
	) => Promise<boolean | void> | boolean | void;
}
