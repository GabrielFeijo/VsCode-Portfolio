import { getLocalizedPath } from '@/config/seo';
import { PAGE_ROUTES } from '../terminalConfig';
import { ICommandDefinition } from './command.types';

export const navigationCommands: ICommandDefinition[] = [
	{
		name: 'route',
		aliases: ['rota'],
		description: 'Navigate to a portfolio route',
		execute: (arg, ctx, rawCommand) => {
			const route = arg.toLowerCase();
			if (!PAGE_ROUTES.includes(route as (typeof PAGE_ROUTES)[number])) {
				ctx.addEntry(rawCommand, [
					`\x1b[91m✗\x1b[0m ${ctx.t('terminal.info.invalidRoute')}`,
					`\x1b[90m  ${PAGE_ROUTES.join(', ')}\x1b[0m`,
				]);
				return true;
			}
			ctx.navigate(getLocalizedPath(`/${route}`, ctx.language));
			ctx.addEntry(rawCommand, [`\x1b[92m→\x1b[0m ${ctx.t('terminal.info.navigating', { route })}`]);
			return true;
		},
	},
	{
		name: 'evaluate',
		aliases: ['avaliar'],
		description: 'Open evaluation / review modal',
		execute: (_arg, ctx, rawCommand) => {
			ctx.setRanking(true);
			ctx.addEntry(rawCommand, [`\x1b[92m→\x1b[0m ${ctx.t('terminal.info.openRating')}`]);
			return true;
		},
	},
];
