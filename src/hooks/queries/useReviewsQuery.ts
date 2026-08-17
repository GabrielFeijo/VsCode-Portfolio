import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateReviewInput, IRate, ReviewService } from '@/services/api/review/ReviewService';

export const REVIEWS_QUERY_KEY = ['reviews'] as const;

export function useReviewsQuery() {
	return useQuery({
		queryKey: REVIEWS_QUERY_KEY,
		queryFn: async (): Promise<IRate[]> => {
			const res = await ReviewService.findAll();
			if (res instanceof Error) {
				return [];
			}
			return res;
		},
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 60,
	});
}

export function useCreateReviewMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (review: CreateReviewInput) => {
			const res = await ReviewService.create(review);
			if (res instanceof Error) {
				throw res;
			}
			return res;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: REVIEWS_QUERY_KEY });
		},
	});
}
