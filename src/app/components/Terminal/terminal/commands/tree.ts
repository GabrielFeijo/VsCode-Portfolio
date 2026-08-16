import { generateTree } from '../utils/pathUtils';
import { parseFlagsAndArgs } from '../utils/commandArgs';
import { ICommandDefinition } from './command.types';

export const treeCommand: ICommandDefinition = {
	name: 'tree',
	description: 'Display directory tree structure',
	execute: (arg, ctx, rawCommand) => {
		const { args } = parseFlagsAndArgs(arg);
		const targetPath = args[0] || '';
		const result = generateTree(targetPath, ctx.cwd, ctx.fs);

		if (result.error) {
			ctx.addEntry(rawCommand, [`\x1b[91m${result.error}\x1b[0m`], ctx.terminalColors.error);
			return true;
		}
		ctx.addEntry(rawCommand, result.lines || []);
		return true;
	},
};
