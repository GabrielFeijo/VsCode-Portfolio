import { ICommandDefinition } from './command.types';

export const pwdCommand: ICommandDefinition = {
	name: 'pwd',
	description: 'Print current working directory',
	execute: (_arg, ctx, rawCommand) => {
		ctx.addEntry(rawCommand, [ctx.cwd]);
		return true;
	},
};
