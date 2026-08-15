import apiFetch from '../axios-config';
import { ApiError, DEFAULT_ERROR_MESSAGE, toApiError } from '../apiError';

export interface ICommand {
	_id: string;
	command: string;
	response: string[];
	created_at: string;
	updatedAt: string;
}

const getResponse = async (command: string): Promise<ICommand | ApiError> => {
	try {
		const { data } = await apiFetch.get(`/command/${encodeURIComponent(command)}`);

		if (data) return data;

		return new Error(DEFAULT_ERROR_MESSAGE);
	} catch (error) {
		return toApiError(error);
	}
};

const findAll = async (): Promise<ICommand[] | ApiError> => {
	try {
		const { data } = await apiFetch.get('/command');
		if (data) return data;
		return new Error(DEFAULT_ERROR_MESSAGE);
	} catch (error) {
		return toApiError(error);
	}
};

export const CommandService = {
	getResponse,
	findAll,
};
