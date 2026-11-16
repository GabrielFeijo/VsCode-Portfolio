import type { CommandDefinition } from './command-types';

export const manCommand: CommandDefinition = {
	name: 'man',
	description: 'Format and display manual pages',
	execute: (arg, ctx, rawCommand) => {
		const manCmd = arg.toLowerCase() || 'help';
		ctx.addEntry(rawCommand, [
			`\x1b[1m${manCmd.toUpperCase()}(1)\x1b[0m`,
			`NAME`,
			`    ${manCmd} - portfolio terminal command`,
			``,
			`SYNOPSIS`,
			`    ${manCmd} [options]`,
			``,
			`DESCRIPTION`,
			`    Type 'help' for full command list.`,
		]);
		return true;
	},
};
