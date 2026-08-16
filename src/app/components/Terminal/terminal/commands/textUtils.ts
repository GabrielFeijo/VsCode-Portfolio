import { parseFlagsAndArgs } from '../utils/commandArgs';
import { getFileLinesAsync } from '../utils/fileLookup';
import { normalizePath } from '../utils/pathUtils';
import { ICommandDefinition } from './command.types';

function parseHeadTailOptions(tokens: string[]): { count: number; fileArg: string } {
	let count = 10;
	let fileArg = '';

	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];
		if (token === '-n' && tokens[i + 1]) {
			count = parseInt(tokens[i + 1], 10) || 10;
			i += 1;
			continue;
		}
		if (token.startsWith('-n') && token.length > 2) {
			count = parseInt(token.slice(2), 10) || 10;
			continue;
		}
		if (!fileArg) {
			fileArg = token;
		}
	}

	return { count, fileArg };
}

export const textUtilsCommands: ICommandDefinition[] = [
	{
		name: 'head',
		aliases: ['tail'],
		description: 'Output the first or last part of files',
		execute: async (arg, ctx, rawCommand) => {
			const cmd = rawCommand.trim().split(/\s+/)[0].toLowerCase();
			const tokens = arg.split(/\s+/).filter(Boolean);
			const { count, fileArg } = parseHeadTailOptions(tokens);

			if (!fileArg) {
				ctx.addEntry(rawCommand, [`\x1b[33mUsage: ${cmd} [-n lines] <filename>\x1b[0m`]);
				return true;
			}

			const filePath = normalizePath(ctx.cwd, fileArg);
			const parent = filePath.substring(0, filePath.lastIndexOf('/')) || '/';
			const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
			const lines = await getFileLinesAsync(ctx.fs, parent, fileName, ctx.language);

			if (!lines) {
				ctx.addEntry(rawCommand, [`\x1b[91m${cmd}: ${fileArg}: No such file\x1b[0m`], ctx.terminalColors.error);
				return true;
			}

			const sliced = cmd === 'head' ? lines.slice(0, count) : lines.slice(-count);
			ctx.addEntry(rawCommand, sliced);
			return true;
		},
	},
	{
		name: 'grep',
		description: 'Print lines matching a pattern',
		execute: async (arg, ctx, rawCommand) => {
			const { flags, args } = parseFlagsAndArgs(arg);
			if (args.length < 2) {
				ctx.addEntry(rawCommand, ['\x1b[33mUsage: grep [-i] <pattern> <filename>\x1b[0m']);
				return true;
			}

			const patternStr = args[0];
			const fileArg = args[1];
			const filePath = normalizePath(ctx.cwd, fileArg);
			const parent = filePath.substring(0, filePath.lastIndexOf('/')) || '/';
			const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
			const lines = await getFileLinesAsync(ctx.fs, parent, fileName, ctx.language);

			if (!lines) {
				ctx.addEntry(rawCommand, [`\x1b[91mgrep: ${fileArg}: No such file\x1b[0m`], ctx.terminalColors.error);
				return true;
			}

			const isCaseInsensitive = flags.has('i');
			const regex = new RegExp(patternStr, isCaseInsensitive ? 'i' : '');
			const matchedLines: string[] = [];

			lines.forEach((line, idx) => {
				if (regex.test(line)) {
					const highlighted = line.replace(
						regex,
						(match) => `\x1b[1;31m${match}\x1b[0m`,
					);
					matchedLines.push(`\x1b[90m${idx + 1}:\x1b[0m ${highlighted}`);
				}
			});

			ctx.addEntry(rawCommand, matchedLines.length > 0 ? matchedLines : []);
			return true;
		},
	},
	{
		name: 'wc',
		description: 'Print newline, word, and byte counts for file',
		execute: async (arg, ctx, rawCommand) => {
			const { flags, args } = parseFlagsAndArgs(arg);
			if (args.length === 0) {
				ctx.addEntry(rawCommand, ['\x1b[33mUsage: wc [-l] <filename>\x1b[0m']);
				return true;
			}

			const fileArg = args[0];
			const filePath = normalizePath(ctx.cwd, fileArg);
			const parent = filePath.substring(0, filePath.lastIndexOf('/')) || '/';
			const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
			const lines = await getFileLinesAsync(ctx.fs, parent, fileName, ctx.language);

			if (!lines) {
				ctx.addEntry(rawCommand, [`\x1b[91mwc: ${fileArg}: No such file\x1b[0m`], ctx.terminalColors.error);
				return true;
			}

			const linesCount = lines.length;
			const wordsCount = lines.join(' ').split(/\s+/).filter(Boolean).length;
			const bytesCount = lines.join('\n').length;

			if (flags.has('l')) {
				ctx.addEntry(rawCommand, [`${String(linesCount).padStart(6)} ${fileArg}`]);
				return true;
			}

			ctx.addEntry(rawCommand, [
				`${String(linesCount).padStart(6)} ${String(wordsCount).padStart(6)} ${String(bytesCount).padStart(6)} ${fileArg}`,
			]);
			return true;
		},
	},
];
