import axios from 'axios';

export function createApiClient(baseUrl: string) {
	return axios.create({
		baseURL: `${baseUrl}/v2`,
		headers: {
			'Content-Type': 'application/json',
		},
	});
}
