import axios from 'axios';
import apiFetch from '../axios-config';

export interface IRate {
	_id: string;
	username: string;
	comment: string;
	stars: number;
	created_at: string;
	updatedAt: string;
}

export const MENSAGEM_ERRO_PADRAO = 'Ocorreu um erro interno no servidor';

const findAll = async (): Promise<IRate[] | Error> => {
	try {
		const { data } = await apiFetch.get(`/reviews`);

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

const create = async (review: {
	username: string;
	comment: string;
	stars: number;
}): Promise<IRate | Error> => {
	try {
		const { data } = await apiFetch.post(`/createReview`, review);

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

export const ReviewService = {
	findAll,
	create,
};
