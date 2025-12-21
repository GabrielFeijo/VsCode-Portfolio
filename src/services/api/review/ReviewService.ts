import axios from 'axios';
import apiFetch from '../axios-config';

export interface IRate {
	_id: string;
	username: string;
	comment: string;
	stars: number;
	createdAt?: string;
	updatedAt: string;
}

export interface ApiError extends Error {
	statusCode?: number;
	validationErrors?: string[];
}

export const DEFAULT_ERROR_MESSAGE = 'Ocorreu um erro interno no servidor';

const findAll = async (): Promise<IRate[] | Error> => {
	try {
		const { data } = await apiFetch.get(`/review`);

		if (data) return data;

		return new Error(DEFAULT_ERROR_MESSAGE);
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return new Error(error.message);
		}

		return new Error(DEFAULT_ERROR_MESSAGE);
	}
};

const create = async (review: {
	username: string;
	comment: string;
	stars: number;
}): Promise<IRate | ApiError> => {
	try {
		const { data } = await apiFetch.post(`/review`, review);

		if (data) return data;

		return new Error(DEFAULT_ERROR_MESSAGE) as ApiError;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const apiError = new Error(error.message) as ApiError;
			apiError.statusCode = error.response?.status;

			if (error.response?.status === 400 && error.response?.data?.message) {
				const messages = error.response.data.message;
				apiError.validationErrors = Array.isArray(messages) ? messages : [messages];
			}

			return apiError;
		}

		return new Error(DEFAULT_ERROR_MESSAGE) as ApiError;
	}
};

export const ReviewService = {
	findAll,
	create,
};
