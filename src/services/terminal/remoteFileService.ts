import { stripFileExtension } from '@/utils/stripFileExtension';

const contentCache = new Map<string, string>();

function getCandidateUrls(normalized: string, language: string): string[] {
	if (normalized.startsWith('public/')) {
		return [`/${normalized.replace(/^public\//, '')}`];
	}
	if (normalized.startsWith('pages/') || normalized.startsWith('styles/')) {
		return [`/${normalized}`];
	}

	const baseName = stripFileExtension(normalized);
	return [
		`/pages/${language}/${baseName}.html`,
		`/pages/${language === 'pt' ? 'en' : 'pt'}/${baseName}.html`,
		`/${normalized}`,
	];
}

export async function fetchFileContent(
	filePathOrName: string,
	language = 'pt',
): Promise<string | null> {
	const normalized = filePathOrName.replace(/^\.?\//, '');
	if (contentCache.has(normalized)) {
		return contentCache.get(normalized) as string;
	}

	const candidates = getCandidateUrls(normalized, language);

	for (const url of candidates) {
		try {
			const res = await fetch(url);
			if (res.ok) {
				const text = await res.text();
				contentCache.set(normalized, text);
				return text;
			}
		} catch {
			continue;
		}
	}

	return null;
}

export function clearFileContentCache(): void {
	contentCache.clear();
}
