import { API_HOST, API_ROOT_URL } from '@/config/terminalIdentity';
import { ReviewService } from '@/services/api/review/ReviewService';
import { formatReviews } from '../utils/formatters';
import type { ICommandDefinition } from './command.types';

export const networkCommands: ICommandDefinition[] = [
	{
		name: 'reviews',
		aliases: ['avaliacoes'],
		description: 'List user reviews',
		execute: async (_arg, ctx, rawCommand) => {
			const data = await ReviewService.findAll();
			if (data instanceof Error) {
				ctx.addEntry(
					rawCommand,
					[`\x1b[91m✗\x1b[0m ${ctx.t('terminal.info.errorShort')}`],
					ctx.terminalColors.error,
				);
				return true;
			}
			ctx.addEntry(rawCommand, ['', ...formatReviews(data, ctx.t)]);
			return true;
		},
	},
	{
		name: 'ping',
		description: 'Send ICMP ECHO_REQUEST to network hosts',
		execute: (arg, ctx, rawCommand) => {
			const host = arg || API_HOST;
			ctx.addEntry(rawCommand, [
				`PING ${host} (127.0.0.1): 56 data bytes`,
				`\x1b[92m64 bytes from ${host}: icmp_seq=0 ttl=64 time=0.42 ms\x1b[0m`,
				`\x1b[92m64 bytes from ${host}: icmp_seq=1 ttl=64 time=0.38 ms\x1b[0m`,
				`\x1b[92m64 bytes from ${host}: icmp_seq=2 ttl=64 time=0.41 ms\x1b[0m`,
				`--- ${host} ping statistics ---`,
				`3 packets transmitted, 3 received, 0% packet loss`,
			]);
			return true;
		},
	},
	{
		name: 'curl',
		description: 'Transfer data from or to a server',
		execute: (arg, ctx, rawCommand) => {
			const url = arg || API_ROOT_URL;
			ctx.addEntry(rawCommand, [
				`\x1b[90m> GET ${url}\x1b[0m`,
				`\x1b[92m< HTTP/1.1 200 OK\x1b[0m`,
				`\x1b[90m< content-type: application/json\x1b[0m`,
				`"Hello World!"`,
			]);
			return true;
		},
	},
];
