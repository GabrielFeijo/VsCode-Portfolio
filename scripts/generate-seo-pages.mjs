import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const buildDirectory = join(projectRoot, 'build');
const seoConfig = JSON.parse(
	await readFile(join(projectRoot, 'src/config/seo.json'), 'utf8')
);
const indexHtml = await readFile(join(buildDirectory, 'index.html'), 'utf8');
const languages = ['pt', 'en'];

function escapeHtml(value) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('"', '&quot;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;');
}

function getLocalizedPath(path, language) {
	if (language === 'pt') return path;
	return path === '/' ? '/en' : `/en${path}`;
}

function getLocalizedUrl(path, language) {
	const localizedPath = getLocalizedPath(path, language);
	return localizedPath === '/'
		? `${seoConfig.site.url}/`
		: `${seoConfig.site.url}${localizedPath}`;
}

function replaceMeta(html, attribute, key, content) {
	const expression = new RegExp(
		`<meta\\s+${attribute}=["']${key}["']\\s+content=["'][^"']*["']\\s*/?>`,
		'i'
	);
	return html.replace(
		expression,
		`<meta ${attribute}="${key}" content="${escapeHtml(content)}" />`
	);
}

function createStructuredData(page, language, canonicalUrl) {
	return {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'Person',
				'@id': `${seoConfig.site.url}/#person`,
				name: seoConfig.site.author,
				url: seoConfig.site.url,
				image: `${seoConfig.site.url}${seoConfig.site.image}`,
				jobTitle: language === 'pt' ? 'Desenvolvedor Full Stack' : 'Full Stack Developer',
				sameAs: [
					'https://github.com/GabrielFeijo',
					'https://www.linkedin.com/in/gabriel-feijo/',
				],
			},
			{
				'@type': 'WebSite',
				'@id': `${seoConfig.site.url}/#website`,
				url: seoConfig.site.url,
				name: seoConfig.site.name,
				inLanguage: ['pt-BR', 'en'],
			},
			{
				'@type': page.path === '/about-me' ? 'ProfilePage' : 'WebPage',
				'@id': `${canonicalUrl}#webpage`,
				url: canonicalUrl,
				name: page[language].title,
				description: page[language].description,
				inLanguage: language === 'pt' ? 'pt-BR' : 'en',
				isPartOf: { '@id': `${seoConfig.site.url}/#website` },
				about: { '@id': `${seoConfig.site.url}/#person` },
			},
		],
	};
}

function createAlternateLinks(page) {
	const portugueseUrl = getLocalizedUrl(page.path, 'pt');
	const englishUrl = getLocalizedUrl(page.path, 'en');
	return [
		`<link rel="alternate" hreflang="pt-BR" href="${portugueseUrl}" />`,
		`<link rel="alternate" hreflang="en" href="${englishUrl}" />`,
		`<link rel="alternate" hreflang="x-default" href="${portugueseUrl}" />`,
	].join('\n\t');
}

function createPageHtml(page, language) {
	const canonicalUrl = getLocalizedUrl(page.path, language);
	const htmlLanguage = language === 'pt' ? 'pt-BR' : 'en';
	const locale = language === 'pt' ? 'pt_BR' : 'en_US';
	const alternateLocale = language === 'pt' ? 'en_US' : 'pt_BR';
	let html = indexHtml
		.replace(/<html\s+lang=["'][^"']+["']>/i, `<html lang="${htmlLanguage}">`)
		.replace(
			/<title>[^<]*<\/title>/i,
			`<title>${escapeHtml(page[language].title)}</title>`
		)
		.replace(
			/<link\s+rel=["']canonical["']\s+href=["'][^"']*["']\s*\/?>/i,
			`<link rel="canonical" href="${canonicalUrl}" />\n\t${createAlternateLinks(page)}`
		);

	html = replaceMeta(html, 'name', 'description', page[language].description);
	html = replaceMeta(html, 'property', 'og:url', canonicalUrl);
	html = replaceMeta(html, 'property', 'og:title', page[language].title);
	html = replaceMeta(html, 'property', 'og:description', page[language].description);
	html = replaceMeta(html, 'property', 'og:locale', locale);
	html = replaceMeta(html, 'property', 'og:locale:alternate', alternateLocale);
	html = replaceMeta(html, 'name', 'twitter:url', canonicalUrl);
	html = replaceMeta(html, 'name', 'twitter:title', page[language].title);
	html = replaceMeta(html, 'name', 'twitter:description', page[language].description);

	const structuredData = JSON.stringify(
		createStructuredData(page, language, canonicalUrl)
	);
	return html.replace(
		/<script\s+id=["']structured-data["'][^>]*>[\s\S]*?<\/script>/i,
		`<script id="structured-data" type="application/ld+json">${structuredData}</script>`
	);
}

for (const page of seoConfig.pages) {
	for (const language of languages) {
		const localizedPath = getLocalizedPath(page.path, language);
		const outputDirectory =
			localizedPath === '/'
				? buildDirectory
				: join(buildDirectory, localizedPath.slice(1));
		await mkdir(outputDirectory, { recursive: true });
		await writeFile(
			join(outputDirectory, 'index.html'),
			createPageHtml(page, language)
		);
	}
}
