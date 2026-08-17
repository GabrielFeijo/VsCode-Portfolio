import { PAGE_ROUTES } from '../terminalConfig';
import { CompletionState, VirtualDirectory } from '../types';
import { PATH_COMMANDS, completePathArgument } from './pathUtils';

const STATIC_COMPLETIONS: Record<string, readonly string[]> = {
	route: PAGE_ROUTES,
	rota: PAGE_ROUTES,
	theme: ['dark', 'light'],
	tema: ['dark', 'light'],
	lang: ['pt', 'en'],
	idioma: ['pt', 'en'],
};

function resolveCandidates(
	cmd: string,
	arg: string,
	trimmed: string,
	spaceIdx: number,
	cwd: string,
	allCommands: string[],
	fs: VirtualDirectory,
	isPath: boolean,
): string[] {
	if (isPath) {
		return completePathArgument(arg, cwd, fs);
	}

	const staticOptions = STATIC_COMPLETIONS[cmd];
	if (staticOptions) {
		const lowerArg = arg.toLowerCase();
		return staticOptions.filter((opt) => opt.startsWith(lowerArg));
	}

	if (cmd === 'man') {
		const lowerArg = arg.toLowerCase();
		return allCommands.filter((c) => c.startsWith(lowerArg));
	}

	if (spaceIdx === -1) {
		const lowerTrimmed = trimmed.toLowerCase();
		return allCommands.filter((c) => c.startsWith(lowerTrimmed));
	}

	return [];
}

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

	const raw = resolveCandidates(cmd, arg, trimmed, spaceIdx, cwd, allCommands, fs, isPath);

	if (raw.length === 0) return { value: null, candidates: [], list: [], isPath };
	const isSubcommand = isPath || cmd !== '';
	const candidates = isSubcommand ? raw.map((c) => `${cmd} ${c}`) : raw;

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
