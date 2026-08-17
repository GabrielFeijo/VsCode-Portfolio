import { StorageService } from '@/services/storageService';
import { PROJECT_FS, PROJECT_ROOT } from '../terminalConfig';
import { calculate, formatResult } from '../utils/calculator';
import { buildNeofetch, formatUptime } from '../utils/formatters';
import { ICommandDefinition } from './command.types';

export const systemCommands: ICommandDefinition[] = [
	{
		name: 'whoami',
		description: 'Print effective user name',
		execute: (_arg, ctx, rawCommand) => {
			ctx.addEntry(rawCommand, ['gabriel']);
			return true;
		},
	},
	{
		name: 'date',
		description: 'Print current system date and time',
		execute: (_arg, ctx, rawCommand) => {
			ctx.addEntry(rawCommand, [new Date().toLocaleString(ctx.language === 'pt' ? 'pt-BR' : 'en-US')]);
			return true;
		},
	},
	{
		name: 'uptime',
		description: 'Show how long the terminal session has been running',
		execute: (_arg, ctx, rawCommand) => {
			ctx.addEntry(rawCommand, [`\x1b[92m up ${formatUptime(ctx.sessionStart)}\x1b[0m`]);
			return true;
		},
	},
	{
		name: 'history',
		description: 'Display terminal command history',
		execute: (_arg, ctx, rawCommand) => {
			if (ctx.history.length === 0) {
				ctx.addEntry(rawCommand, [ctx.t('terminal.info.emptyHistory')]);
			} else {
				ctx.addEntry(
					rawCommand,
					ctx.history.map((h, i) => `\x1b[90m${String(i + 1).padStart(4)}\x1b[0m  ${h}`),
				);
			}
			return true;
		},
	},
	{
		name: 'echo',
		description: 'Display a line of text',
		execute: (arg, ctx, rawCommand) => {
			ctx.addEntry(rawCommand, [arg || '']);
			return true;
		},
	},
	{
		name: 'calc',
		aliases: ['calcular'],
		description: 'Evaluate mathematical expressions',
		execute: (arg, ctx, rawCommand) => {
			if (!arg) {
				ctx.addEntry(rawCommand, [
					'\x1b[33mUsage: calc <expression>\x1b[0m',
					'\x1b[90m  e.g. calc 2 + 2 * 3  ·  calc (10 - 4) / 2  ·  calc 2^8\x1b[0m',
				]);
				return true;
			}
			const result = calculate(arg);
			if (result === null) {
				ctx.addEntry(rawCommand, [`\x1b[91mcalc: invalid expression: ${arg}\x1b[0m`], ctx.terminalColors.error);
				return true;
			}
			ctx.addEntry(rawCommand, [`${arg} = \x1b[92m${formatResult(result)}\x1b[0m`]);
			return true;
		},
	},
	{
		name: 'neofetch',
		description: 'Display system information summary',
		execute: (_arg, ctx, rawCommand) => {
			ctx.addEntry(rawCommand, buildNeofetch({
				isDark: ctx.isDark,
				language: ctx.language,
				uptime: formatUptime(ctx.sessionStart),
			}));
			return true;
		},
	},
	{
		name: 'theme',
		aliases: ['tema', 'changetheme', 'mudartema'],
		description: 'Toggle application theme',
		execute: (_arg, ctx, rawCommand) => {
			ctx.toggleTheme();
			ctx.addEntry(rawCommand, [`\x1b[92m✓\x1b[0m ${ctx.t('terminal.info.theme')}`]);
			return true;
		},
	},
	{
		name: 'lang',
		aliases: ['idioma', 'changelanguage', 'mudaridioma'],
		description: 'Toggle interface language',
		execute: (_arg, ctx, rawCommand) => {
			ctx.changeLanguage();
			ctx.addEntry(rawCommand, [`\x1b[92m✓\x1b[0m ${ctx.t('terminal.info.language')}`]);
			return true;
		},
	},
	{
		name: 'reset',
		aliases: ['reset-data', 'restore'],
		description: 'Reset portfolio data and virtual files to defaults',
		execute: (_arg, ctx, rawCommand) => {
			StorageService.clearData();
			ctx.setFs(PROJECT_FS);
			ctx.setCwd(PROJECT_ROOT);
			ctx.setPreviousCwd(PROJECT_ROOT);
			window.dispatchEvent(new Event('storage'));
			window.dispatchEvent(new CustomEvent('open-tab', { detail: { target: '.' } }));
			ctx.addEntry(rawCommand, [
				'\x1b[92m✔ Portfolio data and files have been reset to factory defaults.\x1b[0m',
				'\x1b[90mAll virtual files and local editor data restored.\x1b[0m',
			]);
			return true;
		},
	},
	{
		name: 'exit',
		description: 'Exit hint',
		execute: (_arg, ctx, rawCommand) => {
			ctx.addEntry(rawCommand, [ctx.t('terminal.info.exitHint')]);
			return true;
		},
	},
];
