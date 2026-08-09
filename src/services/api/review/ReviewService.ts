import apiFetch from '../axios-config';
import {
	ApiError,
	DEFAULT_ERROR_MESSAGE,
	toApiError,
} from '../apiError';

export interface IRate {
	_id: string;
	username: string;
	comment: string;
	stars: number;
	createdAt?: string;
	updatedAt: string;
}

export { ApiError, DEFAULT_ERROR_MESSAGE } from '../apiError';

export interface CreateReviewInput {
	username: string;
	comment: string;
	stars: number;
}

const findAll = async (): Promise<IRate[] | Error> => {
	try {
		const { data } = await apiFetch.get(`/review`);

		if (data) return data;

		return new Error(DEFAULT_ERROR_MESSAGE);
	} catch (error) {
		return toApiError(error);
	}
};

const create = async (review: CreateReviewInput): Promise<IRate | ApiError> => {
	try {
		const { data } = await apiFetch.post(`/review`, review);

		if (data) return data;

		return new ApiError(DEFAULT_ERROR_MESSAGE);
	} catch (error) {
		return toApiError(error, true);
	}
};

export const ReviewService = {
	findAll,
	create,
};
