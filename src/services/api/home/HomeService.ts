import apiFetch from '../axios-config';
import { ApiError, DEFAULT_ERROR_MESSAGE, toApiError } from '../apiError';

export const HOME_REQUEST_TIMEOUT_MS = 10_000;

const getResponse = async (): Promise<unknown | ApiError> => {
	try {
		const { data } = await apiFetch.get(`/`, { timeout: HOME_REQUEST_TIMEOUT_MS });

		if (data) return data;

		return new Error(DEFAULT_ERROR_MESSAGE);
	} catch (error) {
		return toApiError(error);
	}
};

export const HomeService = {
	getResponse,
};
