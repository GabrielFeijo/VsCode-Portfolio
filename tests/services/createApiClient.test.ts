import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { createApiClient } from '../../src/services/api/axios-config/createApiClient';

jest.mock('axios', () => ({
	create: jest.fn(),
}));

describe('createApiClient', () => {
	it('creates an Axios client with the API base URL and JSON headers', () => {
		const client = {} as AxiosInstance;
		const create = axios.create as jest.MockedFunction<typeof axios.create>;
		create.mockReturnValue(client);

		const result = createApiClient('https://api.example.com');

		expect(create).toHaveBeenCalledWith({
			baseURL: 'https://api.example.com/v2',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		expect(result).toBe(client);
	});
});
