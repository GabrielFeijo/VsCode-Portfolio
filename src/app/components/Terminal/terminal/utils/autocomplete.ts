import { CompletionState, VirtualDirectory } from '../types';
import { PATH_COMMANDS, completePathArgument } from './pathUtils';

export function getCompletionState(
	input: string,
	cwd: string,
	allCommands: string[],
	fs: VirtualDirectory,
): CompletionState {
	if (!input) return { value: null, candidates: [], list: [], isPath: false };

	const trimmed = input.trim();
	const spaceIdx = trimmed.indexOf(' ');
	const cmd = spaceIdx > 0 ? trimmed.slice(0, spaceIdx).toLowerCase() : '';
	const arg = spaceIdx > 0 ? trimmed.slice(spaceIdx + 1) : '';
	const isPath = PATH_COMMANDS.includes(cmd);

	const raw = isPath
		? completePathArgument(arg, cwd, fs)
		: allCommands.filter((c) => c.startsWith(trimmed.toLowerCase()));

	if (raw.length === 0) return { value: null, candidates: [], list: [], isPath };
	const candidates = isPath ? raw.map((c) => `${cmd} ${c}`) : raw;

	if (raw.length === 1) {
		const full = candidates[0];
		const value = isPath && full.endsWith('/') ? full : full + ' ';
		return { value, candidates, list: raw, isPath };
	}
	return { value: null, candidates, list: raw, isPath };
}

export function getCompletions(
	input: string,
	cwd: string,
	allCommands: string[],
	fs: VirtualDirectory,
): string[] {
	return getCompletionState(input, cwd, allCommands, fs).candidates;
}
