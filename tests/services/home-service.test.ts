import apiFetch from '../../src/services/api/axios-config';

jest.mock('../../src/services/api/axios-config', () => ({
	__esModule: true,
	default: {
		get: jest.fn(),
		post: jest.fn(),
	},
}));

describe('HomeService', () => {
	afterEach(() => jest.resetAllMocks());

	it('returns data when apiFetch.get resolves with a JSON object', async () => {
		const resp = { data: { hello: 'world' } };
		(apiFetch.get as jest.Mock).mockResolvedValue(resp);
		const mod = await import('../../src/services/api/home/home-service');
		const result = await mod.HomeService.getResponse();
		expect(result).toEqual(resp.data);
	});

	it('returns Error when axios-like error thrown', async () => {
		const err = { isAxiosError: true, message: 'network' };
		(apiFetch.get as jest.Mock).mockRejectedValue(err);
		const mod = await import('../../src/services/api/home/home-service');
		const result = await mod.HomeService.getResponse();
		expect(result).toBeInstanceOf(Error);
		expect((result as Error).message).toBe('network');
	});

	it('returns Error when generic error thrown', async () => {
		(apiFetch.get as jest.Mock).mockRejectedValue(new Error('oops'));
		const mod = await import('../../src/services/api/home/home-service');
		const result = await mod.HomeService.getResponse();
		expect(result).toBeInstanceOf(Error);
	});

	it('returns Error when response contains no data', async () => {
		(apiFetch.get as jest.Mock).mockResolvedValue({ data: null });
		const mod = await import('../../src/services/api/home/home-service');
		const result = await mod.HomeService.getResponse();
		expect(result).toBeInstanceOf(Error);
		expect((result as Error).message).toBe('An unexpected error occurred.');
	});

	it('rejects an HTML fallback page served with status 200', async () => {
		(apiFetch.get as jest.Mock).mockResolvedValue({
			data: '<!doctype html><html><body><div id="root"></div></body></html>',
		});
		const mod = await import('../../src/services/api/home/home-service');
		const result = await mod.HomeService.getResponse();
		expect(result).toBeInstanceOf(Error);
	});
});
