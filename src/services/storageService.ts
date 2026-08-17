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

let _nextIndex = 1000;
function getNextIndex(): number {
	const stored = StorageService.getData();
	const maxStoredIndex = stored.reduce(
		(max, p) => (p.index > max ? p.index : max),
		999
	);
	const next = Math.max(maxStoredIndex + 1, _nextIndex);
	_nextIndex = next + 1;
	return next;
}

export const StorageService = {
	getData: (): Page[] => {
		return parseStoredPages(localStorage.getItem(STORAGE_KEY));
	},

	saveOrUpdateData: (data: Page) => {
		const parsedData = StorageService.getData();

		const updatedData = parsedData.some(
			(page: Page) => page.name === data.name
		)
			? parsedData.map((page: Page) =>
				page.name === data.name ? data : page
			)
			: [...parsedData, data];

		localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
	},

	createFile: (name: string, content = ''): Page => {
		return {
			index: getNextIndex(),
			name,
			route: name,
			content,
			isFolder: false,
		};
	},

	createFolder: (name: string): Page => {
		return {
			index: getNextIndex(),
			name,
			route: name,
			isFolder: true,
			children: [],
		};
	},

	deleteFile: (identifier: number | string) => {
		const data = StorageService.getData();
		const updatedData = data.filter((page) =>
			typeof identifier === 'number'
				? page.index !== identifier
				: page.name !== identifier
		);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
	},

	clearData: () => {
		localStorage.removeItem(STORAGE_KEY);
	},
};
