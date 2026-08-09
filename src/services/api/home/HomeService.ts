import apiFetch from '../axios-config';
import { ApiError, DEFAULT_ERROR_MESSAGE, toApiError } from '../apiError';

const getResponse = async (): Promise<unknown | ApiError> => {
	try {
		const { data } = await apiFetch.get(`/`);

		if (data) return data;

		return new Error(DEFAULT_ERROR_MESSAGE);
	} catch (error) {
		return toApiError(error);
	}
};

export const HomeService = {
	getResponse,
};
