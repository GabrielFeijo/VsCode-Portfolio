import { ICommandDefinition } from './command.types';

export const funCommands: ICommandDefinition[] = [
	{
		name: 'matrix',
		description: 'Follow the white rabbit',
		execute: (_arg, ctx, rawCommand) => {
			ctx.addEntry(rawCommand, [
				'\x1b[92mWake up, Neo...\x1b[0m',
				'\x1b[92mThe Matrix has you...\x1b[0m',
				'\x1b[92mFollow the white rabbit. 🐇\x1b[0m',
				'\x1b[90m01001000 01100101 01101100 01101100 01101111\x1b[0m',
			]);
			return true;
		},
	},
	{
		name: 'cowsay',
		description: 'Talking ASCII cow',
		execute: (arg, ctx, rawCommand) => {
			const msg = arg || 'Moo! I am a terminal cow.';
			const border = '─'.repeat(msg.length + 2);
			ctx.addEntry(rawCommand, [
				` ${border}`,
				`< ${msg} >`,
				` ${border}`,
				'        \\   ^__^',
				'         \\  (oo)\\_______',
				'            (__)\\       )\\/\\',
				'                ||----w |',
				'                ||     ||',
			]);
			return true;
		},
	},
	{
		name: 'banner',
		description: 'Display large ASCII text banner',
		execute: (arg, ctx, rawCommand) => {
			const text = arg || 'GABRIEL';
			const line = '═'.repeat(text.length + 4);
			ctx.addEntry(rawCommand, [
				`\x1b[96m╔${line}╗\x1b[0m`,
				`\x1b[96m║\x1b[0m  \x1b[93m${text}\x1b[0m  \x1b[96m║\x1b[0m`,
				`\x1b[96m╚${line}╝\x1b[0m`,
			]);
			return true;
		},
	},
];
