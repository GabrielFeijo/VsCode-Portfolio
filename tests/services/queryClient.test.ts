import { getRetryDelay, QUERY_RETRY_COUNT, queryClient } from '../../src/services/api/queryClient';

describe('queryClient', () => {
	it('retries transient failures with a capped exponential backoff', () => {
		const defaults = queryClient.getDefaultOptions().queries;

		expect(defaults?.retry).toBe(QUERY_RETRY_COUNT);
		expect(getRetryDelay(0)).toBe(1000);
		expect(getRetryDelay(1)).toBe(2000);
		expect(getRetryDelay(10)).toBe(8000);
	});

	it('does not refetch on window focus', () => {
		expect(queryClient.getDefaultOptions().queries?.refetchOnWindowFocus).toBe(false);
	});
});
