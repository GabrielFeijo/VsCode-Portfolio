import {
	fetchFileContent,
	clearFileContentCache,
} from '../../../src/services/terminal/remoteFileService';

describe('remoteFileService', () => {
	beforeEach(() => {
		clearFileContentCache();
		jest.restoreAllMocks();
	});

	it('returns null when fetch fails', async () => {
		global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

		const content = await fetchFileContent('non-existent.html');
		expect(content).toBeNull();
	});

	it('returns null when response is not ok', async () => {
		global.fetch = jest.fn().mockResolvedValue({
			ok: false,
			status: 404,
		} as Response);

		const content = await fetchFileContent('missing.html');
		expect(content).toBeNull();
	});

	it('fetches and caches content successfully', async () => {
		const mockText = '<main><h1>Sobre mim</h1></main>';
		const fetchMock = jest.fn().mockResolvedValue({
			ok: true,
			text: async () => mockText,
		} as Response);
		global.fetch = fetchMock;

		const content1 = await fetchFileContent('sobre-mim.html', 'pt');
		expect(content1).toBe(mockText);

		const content2 = await fetchFileContent('sobre-mim.html', 'pt');
		expect(content2).toBe(mockText);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it('handles public path and styles prefixes', async () => {
		const mockCss = 'body { color: red; }';
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			text: async () => mockCss,
		} as Response);

		const content = await fetchFileContent('public/styles/about.css');
		expect(content).toBe(mockCss);

		const stylesContent = await fetchFileContent('styles/about.css');
		expect(stylesContent).toBe(mockCss);

		const enContent = await fetchFileContent('about-me.html', 'en');
		expect(enContent).toBe(mockCss);
	});
});
