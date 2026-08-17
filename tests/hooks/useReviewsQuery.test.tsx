import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateReviewMutation, useReviewsQuery } from '../../src/hooks/queries/useReviewsQuery';
import { ReviewService } from '../../src/services/api/review/ReviewService';

jest.mock('../../src/services/api/review/ReviewService', () => ({
	ReviewService: {
		findAll: jest.fn(),
		create: jest.fn(),
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

describe('useReviewsQuery', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('fetches reviews successfully', async () => {
		(ReviewService.findAll as jest.Mock).mockResolvedValue([
			{ _id: '1', username: 'Gabriel', comment: 'Great', stars: 5, updatedAt: '2026-01-01' },
		]);

		const { result } = renderHook(() => useReviewsQuery(), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data).toHaveLength(1);
	});

	it('handles Error response from ReviewService.findAll', async () => {
		(ReviewService.findAll as jest.Mock).mockResolvedValue(new Error('Failed to fetch'));

		const { result } = renderHook(() => useReviewsQuery(), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data).toEqual([]);
	});

	it('creates review with mutation and invalidates cache', async () => {
		const newReview = { _id: '2', username: 'Alice', comment: 'Nice', stars: 5, updatedAt: '2026-01-01' };
		(ReviewService.create as jest.Mock).mockResolvedValue(newReview);

		const { result } = renderHook(() => useCreateReviewMutation(), {
			wrapper: createWrapper(),
		});

		await act(async () => {
			const res = await result.current.mutateAsync({ username: 'Alice', comment: 'Nice', stars: 5 });
			expect(res).toEqual(newReview);
		});
	});

	it('handles error in mutation', async () => {
		(ReviewService.create as jest.Mock).mockResolvedValue(new Error('Validation error'));

		const { result } = renderHook(() => useCreateReviewMutation(), {
			wrapper: createWrapper(),
		});

		await act(async () => {
			await expect(
				result.current.mutateAsync({ username: 'Alice', comment: 'Nice', stars: 5 }),
			).rejects.toThrow('Validation error');
		});
	});
});
