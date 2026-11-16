import type { AxiosInstance } from 'axios';
import axios from 'axios';
import { createApiClient } from '../../src/services/api/axios-config/create-api-client';

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

	it('strips trailing slashes and tolerates an empty or missing baseUrl', () => {
		const client = {} as AxiosInstance;
		const create = axios.create as jest.MockedFunction<typeof axios.create>;
		create.mockReturnValue(client);

		createApiClient('https://api.example.com///');
		expect(create).toHaveBeenLastCalledWith({
			baseURL: 'https://api.example.com/v2',
			headers: { 'Content-Type': 'application/json' },
		});

		createApiClient();
		expect(create).toHaveBeenLastCalledWith({
			baseURL: '/v2',
			headers: { 'Content-Type': 'application/json' },
		});
	});
});
