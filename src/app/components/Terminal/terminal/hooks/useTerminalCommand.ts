import { useCallback, useRef, useState } from 'react';
import { Language } from '@/domain/page';
import { executeLocalCommand } from '../commandExecutor';
import { TerminalColors } from '../terminalConfig';
import { ActiveEditorSession, VirtualDirectory } from '../types';

const MIN_COMMAND_LENGTH = 2;
const LOCALIZED_HELP_PREFIX = 'ajuda';
const HELP_API_COMMAND = 'help';

export interface CommandExecutionDependencies {
	language: Language;
	cwd: string;
	setCwd: (cwd: string) => void;
	previousCwd: string;
	setPreviousCwd: (cwd: string) => void;
	addEntry: (cmd: string, response: string[], color?: string, entryCwd?: string) => void;
	clearEntries: () => void;
	historyRef: React.MutableRefObject<string[]>;
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
	apiCommandList: string[];
	commandMap: Map<string, string[]>;
	fetchApiCommandResponse: (command: string) => Promise<string[] | Error>;
}

export function useTerminalCommand(deps: CommandExecutionDependencies) {
	const depsRef = useRef(deps);
	depsRef.current = deps;

	const [command, setCommandState] = useState('');
	const commandRef = useRef('');
	const [activeEditor, setActiveEditor] = useState<ActiveEditorSession | null>(null);

	const setCommand = useCallback((value: string) => {
		commandRef.current = value;
		setCommandState(value);
	}, []);

	const closeEditor = useCallback(() => {
		setActiveEditor(null);
	}, []);

	const executeCommand = useCallback(async (rawCommand: string): Promise<void> => {
		const trimmed = rawCommand.trim();
		if (trimmed.length < MIN_COMMAND_LENGTH) return;

		const {
			language,
			cwd,
			setCwd,
			previousCwd,
			setPreviousCwd,
			addEntry,
			clearEntries,
			historyRef,
			toggleTheme,
			changeLanguage,
			setRanking,
			navigate,
			terminalColors,
			t,
			sessionStart,
			isDark,
			fs,
			setFs,
			apiCommandList,
			commandMap,
			fetchApiCommandResponse,
		} = depsRef.current;

		const handled = await executeLocalCommand(trimmed, {
			language,
			cwd,
			setCwd,
			previousCwd,
			setPreviousCwd,
			addEntry,
			clearEntries,
			history: historyRef.current,
			toggleTheme,
			changeLanguage,
			setRanking,
			navigate,
			terminalColors,
			t,
			sessionStart,
			isDark,
			fs,
			setFs,
			apiCommandList,
			openEditor: (session) => setActiveEditor(session),
		});

		if (handled) return;

		const lower = trimmed.toLowerCase();
		const cachedResponse = commandMap.get(lower);
		if (cachedResponse) {
			addEntry(trimmed, cachedResponse);
			return;
		}

		const apiCommand = lower.startsWith(LOCALIZED_HELP_PREFIX) ? HELP_API_COMMAND : trimmed;
		const responseData = await fetchApiCommandResponse(apiCommand);

		if (responseData instanceof Error) {
			addEntry(
				trimmed,
				[
					`\x1b[91mzsh: command not found: ${trimmed.split(' ')[0]}\x1b[0m`,
					`\x1b[90mType 'help' for available commands\x1b[0m`,
				],
				terminalColors.error,
			);
			return;
		}

		addEntry(trimmed, responseData);
	}, []);

	const submitCommand = useCallback(async () => {
		const current = commandRef.current;
		commandRef.current = '';
		setCommandState('');
		await executeCommand(current);
	}, [executeCommand]);

	return {
		command,
		commandRef,
		setCommand,
		activeEditor,
		closeEditor,
		executeCommand,
		submitCommand,
	};
}
