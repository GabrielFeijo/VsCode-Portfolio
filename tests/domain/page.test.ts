import { isLanguage, isPage, pageSchema } from '../../src/domain/page';

describe('page domain contracts', () => {
	it('recognizes supported languages', () => {
		expect(isLanguage('pt')).toBe(true);
		expect(isLanguage('en')).toBe(true);
		expect(isLanguage('es')).toBe(false);
	});

	it('accepts valid files and nested folders', () => {
		const validPage = {
			index: 1,
			name: 'folder',
			route: 'folder',
			isFolder: true,
			children: [
				{
					index: 2,
					name: 'notes.md',
					route: 'notes.md',
					content: '',
					isSaved: false,
				},
			],
		};

		expect(isPage(validPage)).toBe(true);
		expect(pageSchema.safeParse(validPage).success).toBe(true);
	});

	it.each([
		null,
		{},
		{ index: Number.NaN, name: 'a', route: 'a' },
		{ index: 1, name: 2, route: 'a' },
		{ index: 1, name: 'a', route: 2 },
		{ index: 1, name: 'a', route: 'a', content: 2 },
		{ index: 1, name: 'a', route: 'a', isSaved: 'yes' },
		{ index: 1, name: 'a', route: 'a', isFolder: 'yes' },
		{ index: 1, name: 'a', route: 'a', children: [{}] },
	])('rejects invalid page data: %p', (value) => {
		expect(isPage(value)).toBe(false);
		expect(pageSchema.safeParse(value).success).toBe(false);
	});
});
