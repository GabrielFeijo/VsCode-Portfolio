import { StorageService, Page } from '../../src/services/storageService';

describe('StorageService', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.restoreAllMocks();
    });

    it('getData returns empty array when nothing stored', () => {
        expect(StorageService.getData()).toEqual([]);
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
        localStorage.setItem('markdown-editor-data', JSON.stringify([page]));
        const updated: Page = { index: 2, name: 'b', route: 'b' };
        StorageService.saveOrUpdateData(updated);
        const stored = StorageService.getData();
        expect(stored).toHaveLength(1);
        expect(stored[0].name).toBe('b');
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

    it('deleteFile removes by index and by name', () => {
        const p1: Page = { index: 10, name: 'one', route: 'one' };
        const p2: Page = { index: 20, name: 'two', route: 'two' };
        localStorage.setItem('markdown-editor-data', JSON.stringify([p1, p2]));
        StorageService.deleteFile(10);
        expect(StorageService.getData()).toHaveLength(1);
        StorageService.deleteFile('two');
        expect(StorageService.getData()).toHaveLength(0);
    });
});
