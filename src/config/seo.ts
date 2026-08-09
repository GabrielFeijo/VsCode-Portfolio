import { Language } from '../domain/page';
import seoConfig from './seo.json';
import { siteConfig } from './site';

export interface AlternateUrls {
	en: string;
	pt: string;
	xDefault: string;
}

export interface PageMetadata {
	alternateUrls: AlternateUrls;
	canonicalUrl: string;
	description: string;
	language: Language;
	path: string;
	title: string;
}

export function normalizeSeoPath(pathname: string): string {
	const cleanPath = pathname.split('?')[0].split('#')[0];
	if (cleanPath === '/' || cleanPath === '') return '/';
	return `/${cleanPath.replace(/^\/+|\/+$/g, '')}`;
}

export function getLanguageFromPathname(pathname: string): Language {
	const normalizedPath = normalizeSeoPath(pathname);
	return normalizedPath === '/en' || normalizedPath.startsWith('/en/')
		? 'en'
		: 'pt';
}

export function getBasePath(pathname: string): string {
	const normalizedPath = normalizeSeoPath(pathname);
	if (getLanguageFromPathname(normalizedPath) === 'pt') return normalizedPath;

	const pathWithoutLanguage = normalizedPath.slice(3);
	return pathWithoutLanguage || '/';
}

export function getLocalizedPath(pathname: string, language: Language): string {
	const basePath = getBasePath(pathname);
	if (language === 'pt') return basePath;
	return basePath === '/' ? '/en' : `/en${basePath}`;
}

export function getLocalizedUrl(pathname: string, language: Language): string {
	const localizedPath = getLocalizedPath(pathname, language);
	return localizedPath === '/'
		? `${siteConfig.url}/`
		: `${siteConfig.url}${localizedPath}`;
}

export function getPageMetadata(pathname: string): PageMetadata {
	const language = getLanguageFromPathname(pathname);
	const basePath = getBasePath(pathname);
	const page =
		seoConfig.pages.find(({ path }) => path === basePath) || seoConfig.pages[0];
	const portugueseUrl = getLocalizedUrl(page.path, 'pt');

	return {
		...page[language],
		language,
		path: page.path,
		canonicalUrl: getLocalizedUrl(page.path, language),
		alternateUrls: {
			pt: portugueseUrl,
			en: getLocalizedUrl(page.path, 'en'),
			xDefault: portugueseUrl,
		},
	};
}

export const indexablePaths = seoConfig.pages.map(({ path }) => path);
