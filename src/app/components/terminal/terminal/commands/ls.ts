import { parseFlagsAndArgs } from '../utils/command-args';
import { listDirectory } from '../utils/path-utils';
import type { CommandDefinition } from './command-types';

export const lsCommand: CommandDefinition = {
	name: 'ls',
	description: 'List directory contents',
	execute: (arg, ctx, rawCommand) => {
		const { flags, args } = parseFlagsAndArgs(arg);
		const targetPath = args[0] || '';
		const result = listDirectory(targetPath, ctx.cwd, ctx.fs, {
			showAll: flags.has('a'),
			longListing: flags.has('l'),
		});

		if (result.error !== undefined) {
			ctx.addEntry(rawCommand, [`\x1b[91m${result.error}\x1b[0m`], ctx.terminalColors.error);
			return true;
		}
		ctx.addEntry(rawCommand, result.lines);
		return true;
	},
};
