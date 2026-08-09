import { isLanguage, isPage } from '../../src/domain/page';

describe('page domain contracts', () => {
	it('recognizes supported languages', () => {
		expect(isLanguage('pt')).toBe(true);
		expect(isLanguage('en')).toBe(true);
		expect(isLanguage('es')).toBe(false);
	});

	it('accepts valid files and nested folders', () => {
		expect(
			isPage({
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
			})
		).toBe(true);
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
	});
});
