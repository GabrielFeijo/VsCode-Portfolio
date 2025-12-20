import apiFetch from '../../src/services/api/axios-config';

jest.mock('../../src/services/api/axios-config', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn(),
    },
}));

describe('ReviewService', () => {
    afterEach(() => jest.resetAllMocks());

    it('findAll returns data on success', async () => {
        const resp = { data: [{ id: 1 }] };
        (apiFetch.get as jest.Mock).mockResolvedValue(resp);
        const mod = await import('../../src/services/api/review/ReviewService');
        const result = await mod.ReviewService.findAll();
        expect(result).toEqual(resp.data);
    });

    it('create returns created item on success', async () => {
        const payload = { title: 'x' };
        const resp = { data: { id: 2, ...payload } };
        (apiFetch.post as jest.Mock).mockResolvedValue(resp);
        const mod = await import('../../src/services/api/review/ReviewService');
        const result = await mod.ReviewService.create(payload as any);
        expect(result).toEqual(resp.data);
    });

    it('returns Error for axios-like failures', async () => {
        const err = { isAxiosError: true, message: 'bad' };
        (apiFetch.get as jest.Mock).mockRejectedValue(err);
        const mod = await import('../../src/services/api/review/ReviewService');
        const result = await mod.ReviewService.findAll();
        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe('bad');
    });

    it('returns Error when findAll receives no data', async () => {
        (apiFetch.get as jest.Mock).mockResolvedValue({ data: null });
        const mod = await import('../../src/services/api/review/ReviewService');
        const result = await mod.ReviewService.findAll();
        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe('Ocorreu um erro interno no servidor');
    });

    it('returns Error for non-axios failures', async () => {
        (apiFetch.get as jest.Mock).mockRejectedValue(new Error('network error'));
        const mod = await import('../../src/services/api/review/ReviewService');
        const result = await mod.ReviewService.findAll();
        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe('Ocorreu um erro interno no servidor');
    });

    it('returns Error for non-axios failures in create', async () => {
        (apiFetch.post as jest.Mock).mockRejectedValue(new Error('network error'));
        const mod = await import('../../src/services/api/review/ReviewService');
        const result = await mod.ReviewService.create({ username: 'u', comment: 'c', stars: 5 });
        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe('Ocorreu um erro interno no servidor');
    });

    it('returns Error for axios-like failures in create', async () => {
        const err = { isAxiosError: true, message: 'bad create' };
        (apiFetch.post as jest.Mock).mockRejectedValue(err);
        const mod = await import('../../src/services/api/review/ReviewService');
        const result = await mod.ReviewService.create({ username: 'u', comment: 'c', stars: 5 });
        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe('bad create');
    });

    it('returns Error when create receives no data', async () => {
        (apiFetch.post as jest.Mock).mockResolvedValue({ data: null });
        const mod = await import('../../src/services/api/review/ReviewService');
        const result = await mod.ReviewService.create({ username: 'u', comment: 'c', stars: 5 });
        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe('Ocorreu um erro interno no servidor');
    });
});