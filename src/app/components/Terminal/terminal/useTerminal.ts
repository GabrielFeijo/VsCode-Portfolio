import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { CommandService } from '@/services/api/command/CommandService';
import { useCommandsQuery } from '@/hooks/queries/useCommandsQuery';
import {
	LOCAL_COMMANDS,
	PROJECT_FS,
	TERMINAL_DEFAULT_PATH,
	getTerminalColors,
} from './terminalConfig';
import { ActiveEditorSession, TerminalEntry, UseTerminalOptions, VirtualDirectory } from './types';
import { executeLocalCommand } from './commandExecutor';
import { getCompletionState, getCompletions as getCompletionsUtil } from './utils/autocomplete';
import { useTerminalHistory } from './hooks/useTerminalHistory';

export type { TerminalEntry };

const SESSION_START = Date.now();
let entryCounter = 0;

function nextId(): string {
	entryCounter += 1;
	return `entry-${entryCounter}`;
}

export function useTerminal({ language, setRanking, changeLanguage }: UseTerminalOptions) {
	const { t } = useTranslation();
	const { theme, toggleTheme } = useTheme();
	const navigate = useNavigate();
	const terminalColors = getTerminalColors(theme);
	const [cwd, setCwd] = useState(TERMINAL_DEFAULT_PATH);
	const [previousCwd, setPreviousCwd] = useState(TERMINAL_DEFAULT_PATH);
	const [fs, setFs] = useState<VirtualDirectory>(PROJECT_FS);
	const [entries, setEntries] = useState<TerminalEntry[]>([]);
	const [command, setCommand] = useState('');
	const commandRef = useRef('');
	const [activeEditor, setActiveEditor] = useState<ActiveEditorSession | null>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);

	const {
		history,
		historyRef,
		addToHistory,
		navigateUp,
		navigateDown,
	} = useTerminalHistory();

	const isDark = theme === 'dark';

	const { commandMap, allCommandNames } = useCommandsQuery();

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [entries]);

	const addEntry = useCallback(
		(cmd: string, response: string[], color?: string, entryCwd = cwd) => {
			setEntries((prev) => [
				...prev,
				{ id: nextId(), command: cmd, response, color, cwd: entryCwd },
			]);
		},
		[cwd],
	);

	const clearEntries = useCallback(() => {
		setEntries([]);
	}, []);

	const allCommands = Array.from(new Set([...LOCAL_COMMANDS, ...allCommandNames]));

	const executeCommand = async (rawCommand: string): Promise<void> => {
		const trimmed = rawCommand.trim();
		if (trimmed.length <= 1) return;

		addToHistory(trimmed);

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
			sessionStart: SESSION_START,
			isDark,
			fs,
			setFs,
			apiCommandList: allCommandNames,
			openEditor: (session) => setActiveEditor(session),
		});

		if (handled) return;

		const lower = trimmed.toLowerCase();
		const cachedResponse = commandMap.get(lower);
		if (cachedResponse && Array.isArray(cachedResponse)) {
			addEntry(trimmed, cachedResponse);
			return;
		}

		const apiCommand = lower.startsWith('ajuda') ? 'help' : trimmed;
		const responseData = await CommandService.getResponse(apiCommand);

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

		addEntry(trimmed, responseData.response);
	};

	const getCompletions = (input: string): string[] =>
		getCompletionsUtil(input, cwd, allCommands, fs);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		e.stopPropagation();
		if (e.key === 'l' && e.ctrlKey) {
			e.preventDefault();
			clearEntries();
			return;
		}

		if (e.key === 'Tab') {
			e.preventDefault();
			const state = getCompletionState(command, cwd, allCommands, fs);
			if (state.value !== null) {
				commandRef.current = state.value;
				setCommand(state.value);
				return;
			}
			if (state.list.length > 1 && command.trim() !== '') {
				const lines = state.isPath
					? state.list.map((c) =>
							c.endsWith('/') ? `\x1b[94m${c}\x1b[0m` : `\x1b[92m${c}\x1b[0m`,
						)
					: state.list.map((c) => `\x1b[94m${c}\x1b[0m`);
				addEntry(`${command.trim()} <TAB>`, ['', ...lines]);
			}
			return;
		}

		if (e.key === 'ArrowUp') {
			e.preventDefault();
			const previous = navigateUp();
			if (previous !== null) {
				commandRef.current = previous;
				setCommand(previous);
			}
			return;
		}

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			const next = navigateDown();
			if (next !== null) {
				commandRef.current = next;
				setCommand(next);
			}
		}
	};

	const submitCommand = async () => {
		const current = commandRef.current;
		commandRef.current = '';
		setCommand('');
		await executeCommand(current);
	};

	const setCommandValue = (value: string) => {
		commandRef.current = value;
		setCommand(value);
	};

	return {
		cwd,
		entries,
		command,
		setCommand: setCommandValue,
		history,
		isDark,
		fs,
		setFs,
		activeEditor,
		closeEditor: () => setActiveEditor(null),
		inputRef,
		scrollRef,
		handleKeyDown,
		submitCommand,
		getCompletions,
	};
}
