import { listDirectory } from '../utils/pathUtils';
import { parseFlagsAndArgs } from '../utils/commandArgs';
import { ICommandDefinition } from './command.types';

export const lsCommand: ICommandDefinition = {
	name: 'ls',
	description: 'List directory contents',
	execute: (arg, ctx, rawCommand) => {
		const { flags, args } = parseFlagsAndArgs(arg);
		const targetPath = args[0] || '';
		const result = listDirectory(targetPath, ctx.cwd, ctx.fs, {
			showAll: flags.has('a'),
			longListing: flags.has('l'),
		});

		if (result.error) {
			ctx.addEntry(rawCommand, [`\x1b[91m${result.error}\x1b[0m`], ctx.terminalColors.error);
			return true;
		}
		ctx.addEntry(rawCommand, result.lines || []);
		return true;
	},
};
