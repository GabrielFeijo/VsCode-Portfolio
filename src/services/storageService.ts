import { isPage, Page } from '../domain/page';

const STORAGE_KEY = 'markdown-editor-data';

function parseStoredPages(raw: string | null): Page[] {
	if (!raw) return [];

	try {
		const parsed: unknown = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];

		const pages = parsed.filter(isPage);
		if (pages.length !== parsed.length) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
		}
		return pages;
	} catch {
		localStorage.removeItem(STORAGE_KEY);
		return [];
	}
}

export type { Page } from '../domain/page';

export const StorageService = {
	getData: (): Page[] => {
		return parseStoredPages(localStorage.getItem(STORAGE_KEY));
	},

	saveOrUpdateData: (data: Page) => {
		const parsedData = StorageService.getData();

		const updatedData = parsedData.some(
			(page: Page) => page.index === data.index
		)
			? parsedData.map((page: Page) =>
				page.index === data.index ? data : page
			)
			: [...parsedData, data];

		localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
	},

	createFile: (name: string, content = ''): Page => {
		return {
			index: Date.now(),
			name,
			route: name,
			content,
			isFolder: false,
		};
	},

	createFolder: (name: string): Page => {
		return {
			index: Date.now(),
			name,
			route: name,
			isFolder: true,
			children: [],
		};
	},

	deleteFile: (identifier: number | string) => {
		const data = StorageService.getData();
		const updatedData = data.filter((page) => {
			if (typeof identifier === 'number') {
				return page.index !== identifier;
			}
			return page.name !== identifier;
		});
		localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
	},

	clearData: () => {
		localStorage.removeItem(STORAGE_KEY);
	},
};
