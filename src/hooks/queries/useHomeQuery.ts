import { useQuery } from '@tanstack/react-query';
import { HomeService } from '@/services/api/home/HomeService';

export const HOME_QUERY_KEY = ['home'] as const;

export function useHomeQuery() {
	return useQuery({
		queryKey: HOME_QUERY_KEY,
		queryFn: async () => {
			const res = await HomeService.getResponse();
			if (res instanceof Error) {
				return null;
			}
			return res;
		},
		staleTime: 1000 * 60 * 60 * 24,
		gcTime: 1000 * 60 * 60 * 24,
	});
}
