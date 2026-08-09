import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const buildDirectory = join(projectRoot, 'build');
const seoConfig = JSON.parse(
	await readFile(join(projectRoot, 'src/config/seo.json'), 'utf8')
);
const languages = ['pt', 'en'];

function escapeExpression(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

function getHtmlPath(path, language) {
	const localizedPath = getLocalizedPath(path, language);
	return localizedPath === '/'
		? join(buildDirectory, 'index.html')
		: join(buildDirectory, localizedPath.slice(1), 'index.html');
}

function expectMeta(html, attribute, key, content) {
	assert.match(
		html,
		new RegExp(
			`<meta\\s+${attribute}=["']${escapeExpression(key)}["']\\s+content=["']${escapeExpression(content)}["']\\s*/?>`,
			'i'
		)
	);
}

function expectLink(html, rel, attribute, key, href) {
	assert.match(
		html,
		new RegExp(
			`<(?:xhtml:)?link\\s+rel=["']${rel}["']\\s+${attribute}=["']${escapeExpression(key)}["']\\s+href=["']${escapeExpression(href)}["']\\s*/?>`,
			'i'
		)
	);
}

const expectedUrls = [];
const titles = new Set();

for (const page of seoConfig.pages) {
	const portugueseUrl = getLocalizedUrl(page.path, 'pt');
	const englishUrl = getLocalizedUrl(page.path, 'en');

	for (const language of languages) {
		const canonicalUrl = getLocalizedUrl(page.path, language);
		const html = await readFile(getHtmlPath(page.path, language), 'utf8');
		const htmlLanguage = language === 'pt' ? 'pt-BR' : 'en';
		const metadata = page[language];

		assert.match(html, new RegExp(`<html\\s+lang=["']${htmlLanguage}["']>`, 'i'));
		assert.match(html, new RegExp(`<title>${escapeExpression(metadata.title)}</title>`));
		assert.match(
			html,
			new RegExp(
				`<link\\s+rel=["']canonical["']\\s+href=["']${escapeExpression(canonicalUrl)}["']\\s*/?>`,
				'i'
			)
		);
		expectLink(html, 'alternate', 'hreflang', 'pt-BR', portugueseUrl);
		expectLink(html, 'alternate', 'hreflang', 'en', englishUrl);
		expectLink(html, 'alternate', 'hreflang', 'x-default', portugueseUrl);
		expectMeta(html, 'name', 'description', metadata.description);
		expectMeta(html, 'property', 'og:url', canonicalUrl);
		expectMeta(html, 'name', 'twitter:url', canonicalUrl);

		const structuredDataMatch = html.match(
			/<script\s+id=["']structured-data["'][^>]*>([\s\S]*?)<\/script>/i
		);
		assert.ok(
			structuredDataMatch,
			`Missing structured data for ${getLocalizedPath(page.path, language)}`
		);
		const structuredData = JSON.parse(structuredDataMatch[1]);
		const webPage = structuredData['@graph'][2];
		assert.equal(structuredData['@context'], 'https://schema.org');
		assert.equal(webPage.url, canonicalUrl);
		assert.equal(webPage.name, metadata.title);
		assert.equal(webPage.description, metadata.description);
		assert.equal(webPage.inLanguage, htmlLanguage);

		assert.ok(!titles.has(metadata.title), `Duplicate title: ${metadata.title}`);
		titles.add(metadata.title);
		expectedUrls.push(canonicalUrl);
	}
}

const sitemap = await readFile(join(buildDirectory, 'sitemap.xml'), 'utf8');
const sitemapEntries = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(
	([, entry]) => entry
);
const sitemapUrls = sitemapEntries.map((entry) => entry.match(/<loc>([^<]+)<\/loc>/)?.[1]);
assert.deepEqual(sitemapUrls, expectedUrls);

for (let pageIndex = 0; pageIndex < seoConfig.pages.length; pageIndex += 1) {
	const page = seoConfig.pages[pageIndex];
	const portugueseUrl = getLocalizedUrl(page.path, 'pt');
	const englishUrl = getLocalizedUrl(page.path, 'en');

	for (const languageIndex of [0, 1]) {
		const entry = sitemapEntries[pageIndex * languages.length + languageIndex];
		expectLink(entry, 'alternate', 'hreflang', 'pt-BR', portugueseUrl);
		expectLink(entry, 'alternate', 'hreflang', 'en', englishUrl);
		expectLink(entry, 'alternate', 'hreflang', 'x-default', portugueseUrl);
	}
}

const robots = await readFile(join(buildDirectory, 'robots.txt'), 'utf8');
assert.match(robots, /Sitemap: https:\/\/www\.gabrielfeijo\.com\.br\/sitemap\.xml/);

const manifest = JSON.parse(
	await readFile(join(buildDirectory, 'site.webmanifest'), 'utf8')
);
assert.equal(manifest.start_url, '/');
assert.equal(manifest.icons.length, 2);
