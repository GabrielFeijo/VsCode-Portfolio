import type { z } from 'zod';
import { type ApiError, toApiError } from '../api-error';
import apiFetch from '../axios-config';
import { commandListSchema, commandSchema, parseApiData } from '../schemas';

export type Command = z.output<typeof commandSchema>;

const getResponse = async (command: string): Promise<Command | ApiError> => {
	try {
		const { data } = await apiFetch.get(`/command/${encodeURIComponent(command)}`);
		return parseApiData(commandSchema, data);
	} catch (error) {
		return toApiError(error);
	}
};

const findAll = async (): Promise<Command[] | ApiError> => {
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
