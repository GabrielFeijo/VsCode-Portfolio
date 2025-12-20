import axios from 'axios';
import apiFetch from '../axios-config';
import { DEFAULT_ERROR_MESSAGE } from '../review/ReviewService';

const getResponse = async () => {
	try {
		const { data } = await apiFetch.get(`/`);

		if (data) return data;

		return new Error(DEFAULT_ERROR_MESSAGE);
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return new Error(error.message);
		}

		return new Error(DEFAULT_ERROR_MESSAGE);
	}
};

export const HomeService = {
	getResponse,
};
