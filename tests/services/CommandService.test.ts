import apiFetch from '../../src/services/api/axios-config';

jest.mock('../../src/services/api/axios-config', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn(),
    },
}));

describe('CommandService', () => {
    afterEach(() => jest.resetAllMocks());

    it('getResponse returns data on success', async () => {
        const resp = { data: { ok: true } };
        (apiFetch.get as jest.Mock).mockResolvedValue(resp);
        const mod = await import('../../src/services/api/command/CommandService');
        const result = await mod.CommandService.getResponse('');
        expect(result).toEqual(resp.data);
    });

    it('returns Error when axios-like error thrown', async () => {
        const err = { isAxiosError: true, message: 'cmdfail' };
        (apiFetch.get as jest.Mock).mockRejectedValue(err);
        const mod = await import('../../src/services/api/command/CommandService');
        const result = await mod.CommandService.getResponse('');
        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe('cmdfail');
    });

    it('returns Error when response contains no data', async () => {
        (apiFetch.get as jest.Mock).mockResolvedValue({ data: null });
        const mod = await import('../../src/services/api/command/CommandService');
        const result = await mod.CommandService.getResponse('nothing');
        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe('Ocorreu um erro interno no servidor');
    });

    it('returns default error for non-axios errors', async () => {
        const nonAxiosError = new Error('Network failure');
        (apiFetch.get as jest.Mock).mockRejectedValue(nonAxiosError);
        const mod = await import('../../src/services/api/command/CommandService');
        const result = await mod.CommandService.getResponse('test');
        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe('Ocorreu um erro interno no servidor');
    });
});
