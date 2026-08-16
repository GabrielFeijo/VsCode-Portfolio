import { stripFileExtension } from '@/utils/stripFileExtension';

describe('stripFileExtension', () => {
	it('should remove .md extension case-insensitively', () => {
		expect(stripFileExtension('about-me.md')).toBe('about-me');
		expect(stripFileExtension('about-me.MD')).toBe('about-me');
	});

	it('should remove .html extension case-insensitively', () => {
		expect(stripFileExtension('projects.html')).toBe('projects');
		expect(stripFileExtension('projects.HTML')).toBe('projects');
	});

	it('should return the original string if no .md or .html extension is present', () => {
		expect(stripFileExtension('skills')).toBe('skills');
		expect(stripFileExtension('about.txt')).toBe('about.txt');
	});
});
