import { QueryClient } from '@tanstack/react-query';

export const QUERY_RETRY_COUNT = 2;
export const getRetryDelay = (attempt: number) => Math.min(1000 * 2 ** attempt, 8000);

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 10,
			gcTime: 1000 * 60 * 60 * 24,
			refetchOnWindowFocus: false,
			retry: QUERY_RETRY_COUNT,
			retryDelay: getRetryDelay,
		},
	},
});
