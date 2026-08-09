import {
	getPageMetadata,
	getBasePath,
	getLanguageFromPathname,
	getLocalizedPath,
	indexablePaths,
	normalizeSeoPath,
} from '../../src/config/seo';

describe('SEO configuration', () => {
	it('contains every public application route exactly once', () => {
		expect(indexablePaths).toEqual([
			'/',
			'/about-me',
			'/skills',
			'/projects',
			'/experience',
			'/accomplishments',
			'/certificates',
		]);
		expect(new Set(indexablePaths).size).toBe(indexablePaths.length);
	});

	it('normalizes route slashes, query strings, and hashes', () => {
		expect(normalizeSeoPath('/projects/')).toBe('/projects');
		expect(normalizeSeoPath('//projects?from=home#featured')).toBe('/projects');
		expect(normalizeSeoPath('/')).toBe('/');
	});

	it('maps localized URLs to their language and base route', () => {
		expect(getLanguageFromPathname('/projects')).toBe('pt');
		expect(getLanguageFromPathname('/en/projects')).toBe('en');
		expect(getBasePath('/en/projects/')).toBe('/projects');
		expect(getLocalizedPath('/projects', 'en')).toBe('/en/projects');
		expect(getLocalizedPath('/en/projects', 'pt')).toBe('/projects');
		expect(getLocalizedPath('/', 'en')).toBe('/en');
	});

	it('returns localized and canonical metadata', () => {
		const metadata = getPageMetadata('/en/certificates/');

		expect(metadata.title).toBe('Certificates and education | Gabriel Feijó');
		expect(metadata.canonicalUrl).toBe(
			'https://www.gabrielfeijo.com.br/en/certificates'
		);
		expect(metadata.description.length).toBeGreaterThan(80);
		expect(metadata.alternateUrls).toEqual({
			pt: 'https://www.gabrielfeijo.com.br/certificates',
			en: 'https://www.gabrielfeijo.com.br/en/certificates',
			xDefault: 'https://www.gabrielfeijo.com.br/certificates',
		});
	});

	it('falls back to home metadata for unknown routes', () => {
		expect(getPageMetadata('/unknown').path).toBe('/');
		expect(getPageMetadata('/en/unknown').canonicalUrl).toBe(
			'https://www.gabrielfeijo.com.br/en'
		);
	});
});
