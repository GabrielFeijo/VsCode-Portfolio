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

    it('returns data when apiFetch.get resolves', async () => {
        const resp = { data: { hello: 'world' } };
        (apiFetch.get as jest.Mock).mockResolvedValue(resp);
        const mod = await import('../../src/services/api/home/HomeService');
        const result = await mod.HomeService.getResponse();
        expect(result).toEqual(resp.data);
    });

    it('returns Error when axios-like error thrown', async () => {
        const err = { isAxiosError: true, message: 'network' };
        (apiFetch.get as jest.Mock).mockRejectedValue(err);
        const mod = await import('../../src/services/api/home/HomeService');
        const result = await mod.HomeService.getResponse();
        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe('network');
    });

    it('returns Error when generic error thrown', async () => {
        (apiFetch.get as jest.Mock).mockRejectedValue(new Error('oops'));
        const mod = await import('../../src/services/api/home/HomeService');
        const result = await mod.HomeService.getResponse();
        expect(result).toBeInstanceOf(Error);
    });

    it('returns Error when response contains no data', async () => {
        (apiFetch.get as jest.Mock).mockResolvedValue({ data: null });
        const mod = await import('../../src/services/api/home/HomeService');
        const result = await mod.HomeService.getResponse();
        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe('Ocorreu um erro interno no servidor');
    });
});
