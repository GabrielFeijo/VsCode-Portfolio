import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useHomeQuery } from '../../src/hooks/queries/useHomeQuery';
import { HomeService } from '../../src/services/api/home/HomeService';

jest.mock('../../src/services/api/home/HomeService', () => ({
	HomeService: {
		getResponse: jest.fn(),
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

describe('useHomeQuery', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('fetches home data successfully', async () => {
		(HomeService.getResponse as jest.Mock).mockResolvedValue({ message: 'Hello Home' });

		const { result } = renderHook(() => useHomeQuery(), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data).toEqual({ message: 'Hello Home' });
	});

	it('handles Error response from HomeService.getResponse', async () => {
		(HomeService.getResponse as jest.Mock).mockResolvedValue(new Error('Failed to load'));

		const { result } = renderHook(() => useHomeQuery(), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data).toBeNull();
	});
});
