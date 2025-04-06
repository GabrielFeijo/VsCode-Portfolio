const STORAGE_KEY = 'markdown-editor-data';

export interface Page {
	index: number;
	name: string;
	route: string;
	content?: string;
	isSaved?: boolean;
	isFolder?: boolean;
	children?: Page[];
}

export const StorageService = {
	getData: (): Page[] => {
		const data = localStorage.getItem(STORAGE_KEY);
		return data ? JSON.parse(data) : [];
	},

	saveData: (data: Page[]) => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	},

	createFile: (name: string, content: string = '', parentId?: number): Page => {
		const formattedName = name.toLowerCase().replace(/\s+/g, '-');

		return {
			index: Date.now(),
			name: formattedName,
			route: formattedName,
			content,
			isFolder: false,
		};
	},

	createFolder: (name: string): Page => {
		const formattedName = name.toLowerCase().replace(/\s+/g, '-');

		return {
			index: Date.now(),
			name: formattedName,
			route: formattedName,
			isFolder: true,
			children: [],
		};
	},
};
