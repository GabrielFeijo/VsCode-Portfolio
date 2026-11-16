import type { CommandDefinition } from './command-types';

export const clearCommand: CommandDefinition = {
	name: 'clear',
	aliases: ['limpar'],
	description: 'Clear terminal screen',
	execute: (_arg, ctx) => {
		ctx.clearEntries();
		return true;
	},
};
