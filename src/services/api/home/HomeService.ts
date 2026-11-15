import type { z } from 'zod';
import { type ApiError, toApiError } from '../apiError';
import apiFetch from '../axios-config';
import { homeSchema, parseApiData } from '../schemas';

export const HOME_REQUEST_TIMEOUT_MS = 10_000;

export type HomeData = z.output<typeof homeSchema>;

const getResponse = async (): Promise<HomeData | ApiError> => {
	try {
		const { data } = await apiFetch.get(`/`, { timeout: HOME_REQUEST_TIMEOUT_MS });
		return parseApiData(homeSchema, data);
	} catch (error) {
		return toApiError(error);
	}
};

export const HomeService = {
	getResponse,
};
