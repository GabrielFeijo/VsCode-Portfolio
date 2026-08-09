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

    it('saveOrUpdateData updates existing page', () => {
        const page: Page = { index: 2, name: 'a', route: 'a' };
        const otherPage: Page = { index: 3, name: 'other', route: 'other' };
        localStorage.setItem('markdown-editor-data', JSON.stringify([page, otherPage]));
        const updated: Page = { index: 2, name: 'b', route: 'b' };
        StorageService.saveOrUpdateData(updated);
        const stored = StorageService.getData();
		expect(stored).toHaveLength(2);
        expect(stored[0].name).toBe('b');
		expect(stored[1]).toEqual(otherPage);
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

	it('creates a file with empty content by default', () => {
		const file = StorageService.createFile('empty.md');

		expect(file.content).toBe('');
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
});
