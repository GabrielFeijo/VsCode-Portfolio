import axios from 'axios';
import apiFetch from '../axios-config';
import { DEFAULT_ERROR_MESSAGE } from '../review/ReviewService';

export interface ICommand {
	_id: string;
	command: string;
	response: [string];
	created_at: string;
	updatedAt: string;
}

const getResponse = async (command: string): Promise<ICommand | Error> => {
	try {
		const { data } = await apiFetch.get(`/command/${command}`);

		if (data) return data;

		return new Error(DEFAULT_ERROR_MESSAGE);
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return new Error(error.message);
		}

		return new Error(DEFAULT_ERROR_MESSAGE);
	}
};

export const CommandService = {
	getResponse,
};
