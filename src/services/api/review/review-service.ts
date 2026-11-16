import type { z } from 'zod';
import { type ApiError, toApiError } from '../api-error';
import apiFetch from '../axios-config';
import { createdReviewSchema, parseApiData, reviewListSchema, type reviewSchema } from '../schemas';

export type Review = z.output<typeof reviewSchema>;

export interface CreateReviewInput {
	username: string;
	comment: string;
	stars: number;
}

const findAll = async (): Promise<Review[] | ApiError> => {
	try {
		const { data } = await apiFetch.get(`/review`);
		return parseApiData(reviewListSchema, data);
	} catch (error) {
		return toApiError(error);
	}
};

const create = async (
	review: CreateReviewInput,
): Promise<z.output<typeof createdReviewSchema> | ApiError> => {
	try {
		const { data } = await apiFetch.post(`/review`, review);
		return parseApiData(createdReviewSchema, data);
	} catch (error) {
		return toApiError(error, true);
	}
};

export const ReviewService = {
	findAll,
	create,
};
