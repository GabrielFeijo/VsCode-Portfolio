import { PAGE_FILES } from './pageContentGlob';

export function getStaticPageContent(path: string): string | null {
	if (!path) return null;
	const normalized = path
		.replace(/^\.?\//, '')
		.replace(/^src\//, '')
		.replace(/^public\//, '');

	for (const [key, content] of Object.entries(PAGE_FILES)) {
		const cleanKey = key
			.replace(/^\.\.\/pages\//, '')
			.replace(/^pages\//, '')
			.replace(/^\/src\/pages\//, '');

		if (cleanKey === normalized || key.endsWith(normalized)) {
			return content;
		}
	}
	return null;
}
