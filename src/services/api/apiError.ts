import axios from 'axios';

export const DEFAULT_ERROR_MESSAGE = 'Ocorreu um erro interno no servidor';

export class ApiError extends Error {
	statusCode?: number;
	validationErrors?: string[];
}

interface ErrorResponse {
	message?: string | string[];
}

export function toApiError(
	error: unknown,
	includeValidationErrors = false
): ApiError {
	if (!axios.isAxiosError<ErrorResponse>(error)) {
		return new ApiError(DEFAULT_ERROR_MESSAGE);
	}

	const apiError = new ApiError(error.message);
	apiError.statusCode = error.response?.status;

	const validationMessage = error.response?.data?.message;
	if (
		includeValidationErrors &&
		error.response?.status === 400 &&
		validationMessage
	) {
		apiError.validationErrors = Array.isArray(validationMessage)
			? validationMessage
			: [validationMessage];
	}

	return apiError;
}
