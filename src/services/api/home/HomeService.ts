import axios from 'axios';
import apiFetch from '../axios-config';
import { MENSAGEM_ERRO_PADRAO } from '../review/ReviewService';

const getResponse = async () => {
	try {
		const { data } = await apiFetch.get(`/`);

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

export const HomeService = {
	getResponse,
};
