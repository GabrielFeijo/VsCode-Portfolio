import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type React from 'react';
import { useHomeQuery } from '../../src/hooks/queries/useHomeQuery';
import { HomeService } from '../../src/services/api/home/HomeService';

jest.mock('../../src/services/api/home/HomeService', () => ({
	HomeService: {
		getResponse: jest.fn(),
	},
}));

function createClient() {
	return new QueryClient({
		defaultOptions: {
			queries: { retry: false },
		},
	});
}

function createWrapper(queryClient = createClient()) {
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

	it('surfaces a failed request as a query error instead of a cached success', async () => {
		(HomeService.getResponse as jest.Mock).mockResolvedValue(new Error('Failed to load'));

		const { result } = renderHook(() => useHomeQuery(), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.isError).toBe(true));
		expect(result.current.isSuccess).toBe(false);
		expect(result.current.data).toBeUndefined();
	});

	it('refetches after a failure instead of serving a stale failure for 24h', async () => {
		const client = createClient();
		(HomeService.getResponse as jest.Mock)
			.mockResolvedValueOnce(new Error('cold start'))
			.mockResolvedValueOnce({ ok: true });

		const first = renderHook(() => useHomeQuery(), { wrapper: createWrapper(client) });
		await waitFor(() => expect(first.result.current.isError).toBe(true));
		first.unmount();

		const second = renderHook(() => useHomeQuery(), { wrapper: createWrapper(client) });
		await waitFor(() => expect(second.result.current.isSuccess).toBe(true));
		expect(second.result.current.data).toEqual({ ok: true });
		expect(HomeService.getResponse).toHaveBeenCalledTimes(2);
	});
});
