import { getStaticPageContent } from '../../src/services/pageContentService';
import { PAGE_FILES } from '../mocks/pageContentGlob';

describe('pageContentService', () => {
	beforeEach(() => {
		for (const key of Object.keys(PAGE_FILES)) {
			delete PAGE_FILES[key];
		}
	});

	it('returns null for empty or invalid paths', () => {
		expect(getStaticPageContent('')).toBeNull();
		expect(getStaticPageContent('/missing.html')).toBeNull();
	});

	it('finds and returns static content matching normalized path', () => {
		PAGE_FILES['../pages/pt/sobre-mim.html'] = '<main>Sobre Mim</main>';
		PAGE_FILES['../pages/en/about-me.html'] = '<main>About Me</main>';

		expect(getStaticPageContent('/pages/pt/sobre-mim.html')).toBe('<main>Sobre Mim</main>');
		expect(getStaticPageContent('pages/pt/sobre-mim.html')).toBe('<main>Sobre Mim</main>');
		expect(getStaticPageContent('/src/pages/pt/sobre-mim.html')).toBe('<main>Sobre Mim</main>');
		expect(getStaticPageContent('public/pages/pt/sobre-mim.html')).toBe('<main>Sobre Mim</main>');
		expect(getStaticPageContent('/pages/en/about-me.html')).toBe('<main>About Me</main>');
		expect(getStaticPageContent('non-existent.html')).toBeNull();
	});
});
