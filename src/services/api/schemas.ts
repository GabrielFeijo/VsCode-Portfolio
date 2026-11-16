import { z } from 'zod';
import { ApiError, DEFAULT_ERROR_MESSAGE } from './api-error';

const optionalText = z.string().optional().catch(undefined);

export const commandSchema = z.object({
	_id: optionalText,
	command: z.string().min(1),
	aliases: z.array(z.string()).optional().catch(undefined),
	category: optionalText,
	description: optionalText,
	language: optionalText,
	response: z.array(z.string()),
	created_at: optionalText,
	updatedAt: optionalText,
});

export const commandListSchema = z.array(commandSchema);

export const reviewSchema = z.object({
	_id: z.string(),
	username: z.string(),
	comment: z.string(),
	stars: z.number(),
	createdAt: optionalText,
	updatedAt: optionalText,
});

export const reviewListSchema = z.array(reviewSchema);

export const createdReviewSchema = reviewSchema.partial();

export const homeSchema = z.union([z.array(z.unknown()), z.record(z.string(), z.unknown())]);

export function parseApiData<S extends z.ZodType>(
	schema: S,
	data: unknown,
): z.output<S> | ApiError {
	const result = schema.safeParse(data);
	return result.success ? result.data : new ApiError(DEFAULT_ERROR_MESSAGE);
}
