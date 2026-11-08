import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { useCommandsQuery } from '@/hooks/queries/useCommandsQuery';
import { CommandService } from '@/services/api/command/CommandService';
import { useTerminalCommand } from './hooks/useTerminalCommand';
import { useTerminalEntries } from './hooks/useTerminalEntries';
import { useTerminalHistory } from './hooks/useTerminalHistory';
import { useTerminalKeyboard } from './hooks/useTerminalKeyboard';
import {
	getTerminalColors,
	LOCAL_COMMANDS,
	PROJECT_FS,
	TERMINAL_DEFAULT_PATH,
} from './terminalConfig';
import type { UseTerminalOptions, VirtualDirectory } from './types';
import { getCompletions as getCompletionsUtil } from './utils/autocomplete';

export type { TerminalEntry } from './types';

const SESSION_START = Date.now();

export function useTerminal({ language, setRanking, changeLanguage }: UseTerminalOptions) {
	const { t } = useTranslation();
	const { theme, toggleTheme } = useTheme();
	const navigate = useNavigate();
	const terminalColors = getTerminalColors(theme);

	const [cwd, setCwd] = useState(TERMINAL_DEFAULT_PATH);
	const [previousCwd, setPreviousCwd] = useState(TERMINAL_DEFAULT_PATH);
	const [fs, setFs] = useState<VirtualDirectory>(PROJECT_FS);

	const inputRef = useRef<HTMLTextAreaElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);

	const isDark = theme === 'dark';
	const { commandMap, allCommandNames } = useCommandsQuery();
	const allCommands = useMemo(
		() => Array.from(new Set([...LOCAL_COMMANDS, ...allCommandNames])),
		[allCommandNames],
	);

	const { entries, addEntry, clearEntries } = useTerminalEntries(cwd);

	const { history, historyRef, addToHistory, navigateUp, navigateDown } = useTerminalHistory();

	const fetchApiCommandResponse = useCallback(
		async (apiCommand: string): Promise<string[] | Error> => {
			const responseData = await CommandService.getResponse(apiCommand);
			if (responseData instanceof Error) return responseData;
			return responseData.response;
		},
		[],
	);

	const { command, commandRef, setCommand, activeEditor, closeEditor, executeCommand } =
		useTerminalCommand({
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
			sessionStart: SESSION_START,
			isDark,
			fs,
			setFs,
			apiCommandList: allCommandNames,
			commandMap,
			fetchApiCommandResponse,
		});

	const { handleKeyDown } = useTerminalKeyboard({
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

	useEffect(() => {
		void entries.length;
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [entries]);

	const submitCommand = useCallback(async () => {
		const current = commandRef.current;
		commandRef.current = '';
		setCommand('');
		addToHistory(current);
		await executeCommand(current);
	}, [commandRef, setCommand, addToHistory, executeCommand]);

	const getCompletions = useCallback(
		(input: string): string[] => getCompletionsUtil(input, cwd, allCommands, fs),
		[cwd, fs, allCommands],
	);

	return {
		cwd,
		entries,
		command,
		setCommand,
		history,
		isDark,
		fs,
		setFs,
		activeEditor,
		closeEditor,
		inputRef,
		scrollRef,
		handleKeyDown,
		submitCommand,
		getCompletions,
	};
}
