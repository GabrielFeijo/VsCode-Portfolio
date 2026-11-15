import type { z } from 'zod';
import { type ApiError, toApiError } from '../apiError';
import apiFetch from '../axios-config';
import { commandListSchema, commandSchema, parseApiData } from '../schemas';

export type ICommand = z.output<typeof commandSchema>;

const getResponse = async (command: string): Promise<ICommand | ApiError> => {
	try {
		const { data } = await apiFetch.get(`/command/${encodeURIComponent(command)}`);
		return parseApiData(commandSchema, data);
	} catch (error) {
		return toApiError(error);
	}
};

const findAll = async (): Promise<ICommand[] | ApiError> => {
	try {
		const { data } = await apiFetch.get('/command');
		return parseApiData(commandListSchema, data);
	} catch (error) {
		return toApiError(error);
	}
};

export const CommandService = {
	getResponse,
	findAll,
};
