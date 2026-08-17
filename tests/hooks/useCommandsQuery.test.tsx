import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCommandsQuery } from '../../src/hooks/queries/useCommandsQuery';
import { CommandService } from '../../src/services/api/command/CommandService';

jest.mock('../../src/services/api/command/CommandService', () => ({
	CommandService: {
		findAll: jest.fn(),
	},
}));

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
		},
	});
	return ({ children }: { children: React.ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}

describe('useCommandsQuery', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('returns indexed command map and aliases when findAll succeeds', async () => {
		(CommandService.findAll as jest.Mock).mockResolvedValue([
			{
				command: 'skills',
				aliases: ['habilidades', 'stack'],
				category: 'portfolio',
				response: ['skill 1', 'skill 2'],
			},
			{
				command: 'help',
				response: ['help info'],
			},
		]);

		const { result } = renderHook(() => useCommandsQuery(), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(result.current.commands).toHaveLength(2);
		expect(result.current.commandMap.get('skills')).toEqual(['skill 1', 'skill 2']);
		expect(result.current.commandMap.get('habilidades')).toEqual(['skill 1', 'skill 2']);
		expect(result.current.allCommandNames).toEqual(['skills', 'habilidades', 'stack', 'help']);
		expect(result.current.commandsByCategory['portfolio']).toHaveLength(1);
		expect(result.current.commandsByCategory['general']).toHaveLength(1);
	});

	it('handles Error responses by returning empty list', async () => {
		(CommandService.findAll as jest.Mock).mockResolvedValue(new Error('Network error'));

		const { result } = renderHook(() => useCommandsQuery(), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.commands).toEqual([]);
		expect(result.current.allCommandNames).toEqual([]);
	});
});
