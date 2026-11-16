import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pageRoutes } from '../../src/app/pages/pages';

const pagesDirectory = join(__dirname, '../../src/pages');

function readPage(language: 'pt' | 'en', name: string): string {
	return readFileSync(join(pagesDirectory, language, name), 'utf8');
}

function externalUrls(html: string): string[] {
	const urls = [...html.matchAll(/(?:href|src)="(https?:\/\/[^"]+)"/g)].map(([, url]) => url);
	return [...new Set(urls)].sort();
}

describe('PT/EN page content parity', () => {
	it.each(
		pageRoutes.pt.map((ptPage, index) => [ptPage.route, ptPage.name, pageRoutes.en[index].name]),
	)('%s uses the same external links and images in PT and EN', (_route, ptName, enName) => {
		const pt = externalUrls(readPage('pt', ptName));
		const en = externalUrls(readPage('en', enName));

		expect(en).toEqual(pt);
	});
});
