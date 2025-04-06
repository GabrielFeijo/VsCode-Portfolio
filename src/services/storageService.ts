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

	saveOrUpdateData: (data: Page) => {
		const storageData = localStorage.getItem(STORAGE_KEY);
		const parsedData = storageData ? JSON.parse(storageData) : [];

		const updatedData = parsedData.some(
			(page: Page) => page.index === data.index
		)
			? parsedData.map((page: Page) =>
					page.index === data.index ? data : page
			  )
			: [...parsedData, data];

		localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
	},

	createFile: (name: string, content: string = '', parentId?: number): Page => {
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
			} else {
				return page.name !== identifier;
			}
		});
		localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
	},
};
