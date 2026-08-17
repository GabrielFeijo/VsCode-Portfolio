import { STYLE_FILES } from './styleContentGlob';

export function getStyleContent(href: string): string | null {
	if (!href) return null;
	const fileName = href.split('/').pop()?.split('?')[0];
	if (!fileName) return null;

	for (const [key, content] of Object.entries(STYLE_FILES)) {
		if (key.endsWith(`/${fileName}`) || key === fileName) {
			return content;
		}
	}
	return null;
}
