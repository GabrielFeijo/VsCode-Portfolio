import { useQuery } from '@tanstack/react-query';
import { CommandService, ICommand } from '@/services/api/command/CommandService';

export const COMMANDS_QUERY_KEY = ['commands'] as const;

export function useCommandsQuery() {
	const query = useQuery({
		queryKey: COMMANDS_QUERY_KEY,
		queryFn: async () => {
			const res = await CommandService.findAll();
			if (res instanceof Error) {
				return [];
			}
			return res;
		},
		staleTime: 1000 * 60 * 15,
		gcTime: 1000 * 60 * 60 * 24,
	});

	const commands = query.data ?? [];

	const commandMap = new Map<string, string[]>();
	const allCommandNames: string[] = [];
	const commandsByCategory: Record<string, ICommand[]> = {};

	for (const item of commands) {
		const key = item.command.toLowerCase();
		commandMap.set(key, item.response);
		allCommandNames.push(key);

		const cat = item.category || 'general';
		commandsByCategory[cat] ??= [];
		commandsByCategory[cat].push(item);

		if (item.aliases && Array.isArray(item.aliases)) {
			for (const alias of item.aliases) {
				const aliasKey = alias.toLowerCase();
				commandMap.set(aliasKey, item.response);
				if (!allCommandNames.includes(aliasKey)) {
					allCommandNames.push(aliasKey);
				}
			}
		}
	}

	return {
		...query,
		commands,
		commandMap,
		allCommandNames,
		commandsByCategory,
	};
}
