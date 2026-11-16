import { buildHelp } from '../utils/formatters';
import type { CommandDefinition } from './command-types';

export const helpCommand: CommandDefinition = {
	name: 'help',
	aliases: ['ajuda'],
	description: 'Display available terminal commands',
	execute: (_arg, ctx, rawCommand) => {
		const { addEntry, apiCommandList = [] } = ctx;
		addEntry(rawCommand, buildHelp(apiCommandList));
		return true;
	},
};
