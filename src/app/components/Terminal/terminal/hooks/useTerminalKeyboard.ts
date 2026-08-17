import { VirtualDirectory } from '../types';
import { getCompletionState } from '../utils/autocomplete';

export interface UseTerminalKeyboardOptions {
	command: string;
	cwd: string;
	allCommands: string[];
	fs: VirtualDirectory;
	commandRef: React.MutableRefObject<string>;
	setCommand: (value: string) => void;
	clearEntries: () => void;
	addEntry: (cmd: string, response: string[], color?: string, entryCwd?: string) => void;
	navigateUp: () => string | null;
	navigateDown: () => string | null;
}

export function useTerminalKeyboard({
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
}: UseTerminalKeyboardOptions) {
	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		e.stopPropagation();

		if (e.key === 'l' && e.ctrlKey) {
			e.preventDefault();
			clearEntries();
			return;
		}

		if (e.key === 'Tab') {
			e.preventDefault();
			handleTabCompletion(command, cwd, allCommands, fs, commandRef, setCommand, addEntry);
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

	return { handleKeyDown };
}

function handleTabCompletion(
	command: string,
	cwd: string,
	allCommands: string[],
	fs: VirtualDirectory,
	commandRef: React.MutableRefObject<string>,
	setCommand: (value: string) => void,
	addEntry: (cmd: string, response: string[], color?: string, entryCwd?: string) => void,
): void {
	const state = getCompletionState(command, cwd, allCommands, fs);

	if (state.value !== null) {
		commandRef.current = state.value;
		setCommand(state.value);
		return;
	}

	if (state.list.length > 1 && command.trim() !== '') {
		const lines = state.isPath
			? state.list.map((c) => (c.endsWith('/') ? `\x1b[94m${c}\x1b[0m` : `\x1b[92m${c}\x1b[0m`))
			: state.list.map((c) => `\x1b[94m${c}\x1b[0m`);
		addEntry(`${command.trim()} <TAB>`, ['', ...lines]);
	}
}
