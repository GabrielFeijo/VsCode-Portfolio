import { getFileLinesAsync, hasContent } from '@/app/components/Terminal/terminal/utils/fileLookup';
import { StorageService } from '@/services/storageService';
import { fetchFileContent } from '@/services/terminal/remoteFileService';

jest.mock('@/services/storageService', () => ({
	StorageService: {
		getData: jest.fn(),
	},
}));

jest.mock('@/services/terminal/remoteFileService', () => ({
	fetchFileContent: jest.fn(),
}));

describe('fileLookup', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(StorageService.getData as jest.Mock).mockReturnValue([]);
		(fetchFileContent as jest.Mock).mockResolvedValue(null);
	});

	it('checks hasContent correctly', () => {
		expect(hasContent(undefined)).toBe(false);
		expect(hasContent([])).toBe(false);
		expect(hasContent([''])).toBe(false);
		expect(hasContent(['hello'])).toBe(true);
	});

	it('returns stored content from StorageService when available', async () => {
		(StorageService.getData as jest.Mock).mockReturnValue([
			{ name: 'about.md', content: 'Line 1\nLine 2', index: 0, route: 'about' },
		]);

		const lines = await getFileLinesAsync({}, '/home/gabriel', 'about.md', 'pt');
		expect(lines).toEqual(['Line 1', 'Line 2']);
	});

	it('returns content from fs when file exists in virtual directory', async () => {
		const fs = {
			'/home/gabriel': [{ name: 'file.txt', type: 'file' as const, content: ['line a', 'line b'] }],
		};

		const lines = await getFileLinesAsync(fs, '/home/gabriel', 'file.txt', 'pt');
		expect(lines).toEqual(['line a', 'line b']);
	});

	it('fetches remote content when not present locally and updates exact entry', async () => {
		(fetchFileContent as jest.Mock).mockResolvedValue('remote line 1\nremote line 2');
		const fileEntry = { name: 'remote.html', type: 'file' as const, content: [] };
		const fs = {
			'/home/gabriel': [fileEntry],
		};

		const lines = await getFileLinesAsync(fs, '/home/gabriel', 'remote.html', 'pt');
		expect(lines).toEqual(['remote line 1', 'remote line 2']);
		expect(fileEntry.content).toEqual(['remote line 1', 'remote line 2']);
	});

	it('does not cross-match different language files sharing the same route', async () => {
		(StorageService.getData as jest.Mock).mockReturnValue([
			{ name: 'sobre-mim.html', content: 'Portuguese content', index: 0, route: 'about-me' },
		]);

		const enLines = await getFileLinesAsync({}, '/home/gabriel', 'about-me.html', 'en');
		expect(enLines).toBeNull();
	});

	it('returns null when file is not found anywhere', async () => {
		const lines = await getFileLinesAsync({}, '/home/gabriel', 'nonexistent.txt', 'pt');
		expect(lines).toBeNull();
	});
});
