import axios from 'axios';

export function createApiClient(baseUrl = '') {
	const normalizedBase = baseUrl.trim().replace(/\/+$/, '');
	return axios.create({
		baseURL: `${normalizedBase}/v2`,
		headers: {
			'Content-Type': 'application/json',
		},
	});
}
