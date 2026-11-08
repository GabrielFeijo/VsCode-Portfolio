import { getPageNameAliases, isSamePageName } from '../../src/utils/pageName';

describe('pageName', () => {
	it('returns the original name plus md and html variants', () => {
		expect(getPageNameAliases('about-me.html')).toEqual(['about-me.html', 'about-me.md', 'about-me.html']);
		expect(getPageNameAliases('notes')).toEqual(['notes', 'notes.md', 'notes.html']);
	});

	it('matches a candidate against any alias', () => {
		expect(isSamePageName('skills.md', 'skills.html')).toBe(true);
		expect(isSamePageName('skills.html', 'skills.md')).toBe(true);
		expect(isSamePageName('skills.md', 'skills')).toBe(true);
		expect(isSamePageName('skills', 'skills.md')).toBe(false);
		expect(isSamePageName('projects.md', 'skills.md')).toBe(false);
	});
});
