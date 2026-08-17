import { StorageService, Page } from '../../src/services/storageService';

describe('StorageService', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.restoreAllMocks();
    });

	it('getData returns empty array when nothing stored', () => {
		expect(StorageService.getData()).toEqual([]);
	});

	it('getData recovers from invalid stored data', () => {
		localStorage.setItem('markdown-editor-data', '{invalid');

		expect(StorageService.getData()).toEqual([]);
		expect(localStorage.getItem('markdown-editor-data')).toBeNull();
	});

	it('getData rejects stored values that are not arrays', () => {
		localStorage.setItem('markdown-editor-data', JSON.stringify({ page: 1 }));

		expect(StorageService.getData()).toEqual([]);
	});

	it('getData removes invalid entries while preserving valid pages', () => {
		const validPage = { index: 1, name: 'valid.md', route: 'valid.md' };
		localStorage.setItem(
			'markdown-editor-data',
			JSON.stringify([validPage, { index: 'invalid' }])
		);

		expect(StorageService.getData()).toEqual([validPage]);
		expect(JSON.parse(localStorage.getItem('markdown-editor-data') || '[]')).toEqual([
			validPage,
		]);
	});

    it('saveOrUpdateData adds new page when none exists', () => {
        const page: Page = { index: 1, name: 'a', route: 'a' };
        StorageService.saveOrUpdateData(page);
        const stored = JSON.parse(localStorage.getItem('markdown-editor-data') || '[]');
        expect(stored).toHaveLength(1);
        expect(stored[0].name).toBe('a');
    });

    it('saveOrUpdateData updates existing page by name without overwriting other language files sharing same index', () => {
        const ptPage: Page = { index: 0, name: 'sobre-mim.html', route: 'about-me', content: 'PT original' };
        const enPage: Page = { index: 0, name: 'about-me.html', route: 'about-me', content: 'EN original' };
        StorageService.saveOrUpdateData(ptPage);
        StorageService.saveOrUpdateData(enPage);

        const stored = StorageService.getData();
        expect(stored).toHaveLength(2);
        expect(stored.find((p) => p.name === 'sobre-mim.html')?.content).toBe('PT original');
        expect(stored.find((p) => p.name === 'about-me.html')?.content).toBe('EN original');

        const updatedPt: Page = { index: 0, name: 'sobre-mim.html', route: 'about-me', content: 'PT edited' };
        StorageService.saveOrUpdateData(updatedPt);

        const storedAfter = StorageService.getData();
        expect(storedAfter).toHaveLength(2);
        expect(storedAfter.find((p) => p.name === 'sobre-mim.html')?.content).toBe('PT edited');
        expect(storedAfter.find((p) => p.name === 'about-me.html')?.content).toBe('EN original');
    });

    it('createFile and createFolder produce correct shapes', () => {
        jest.spyOn(Date, 'now').mockReturnValue(123456);
        const file = StorageService.createFile('file', 'ok');
        expect(file.isFolder).toBeFalsy();
        expect(file.content).toBe('ok');

        const folder = StorageService.createFolder('folder');
        expect(folder.isFolder).toBeTruthy();
        expect(Array.isArray(folder.children)).toBe(true);
    });

	it('creates a file with empty content by default and auto-increments index above stored pages', () => {
		const storedPages = [
			{ index: 1500, name: 'stored.md', route: 'stored.md' },
			{ index: 1200, name: 'stored2.md', route: 'stored2.md' },
		];
		localStorage.setItem('markdown-editor-data', JSON.stringify(storedPages));

		const file1 = StorageService.createFile('empty.md');
		expect(file1.content).toBe('');
		expect(file1.index).toBeGreaterThan(1500);

		const file2 = StorageService.createFile('empty2.md');
		expect(file2.index).toBeGreaterThan(file1.index);
	});

    it('deleteFile removes by index and by name', () => {
        const p1: Page = { index: 10, name: 'one', route: 'one' };
        const p2: Page = { index: 20, name: 'two', route: 'two' };
        localStorage.setItem('markdown-editor-data', JSON.stringify([p1, p2]));
        StorageService.deleteFile(10);
        expect(StorageService.getData()).toHaveLength(1);
        StorageService.deleteFile('two');
        expect(StorageService.getData()).toHaveLength(0);
    });

	it('preserves stored pages when deletion has no match', () => {
		const page: Page = { index: 10, name: 'one', route: 'one' };
		localStorage.setItem('markdown-editor-data', JSON.stringify([page]));

		StorageService.deleteFile('missing');

		expect(StorageService.getData()).toEqual([page]);
	});

	it('clearData removes markdown editor data from localStorage', () => {
		const page: Page = { index: 10, name: 'one', route: 'one' };
		StorageService.saveOrUpdateData(page);
		expect(StorageService.getData()).toHaveLength(1);

		StorageService.clearData();
		expect(StorageService.getData()).toHaveLength(0);
	});
});
