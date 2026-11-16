import type { CommandDefinition } from './command-types';

export const pwdCommand: CommandDefinition = {
	name: 'pwd',
	description: 'Print current working directory',
	execute: (_arg, ctx, rawCommand) => {
		ctx.addEntry(rawCommand, [ctx.cwd]);
		return true;
	},
};
