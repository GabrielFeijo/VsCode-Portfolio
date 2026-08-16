import { ICommandDefinition } from './command.types';

export const clearCommand: ICommandDefinition = {
	name: 'clear',
	aliases: ['limpar'],
	description: 'Clear terminal screen',
	execute: (_arg, ctx) => {
		ctx.clearEntries();
		return true;
	},
};
