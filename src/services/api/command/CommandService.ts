import axios from 'axios';
import apiFetch from '../axios-config';
import { MENSAGEM_ERRO_PADRAO } from '../review/ReviewService';

export interface ICommand {
	_id: string;
	command: string;
	response: [string];
	created_at: string;
	updatedAt: string;
}

const getResponse = async (command: string): Promise<ICommand | Error> => {
	try {
		const { data } = await apiFetch.get(`/command`, { params: { command } });

		if (data) {
			return data;
		}

		return new Error(MENSAGEM_ERRO_PADRAO);
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return new Error(error.message);
		} else {
			return new Error(MENSAGEM_ERRO_PADRAO);
		}
	}
};

export const CommandService = {
	getResponse,
};
