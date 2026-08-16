const contentCache = new Map<string, string>();

export async function fetchFileContent(
	filePathOrName: string,
	language = 'pt',
): Promise<string | null> {
	const normalized = filePathOrName.replace(/^\.?\//, '');
	if (contentCache.has(normalized)) {
		return contentCache.get(normalized) ?? null;
	}

	const candidates: string[] = [];
	if (normalized.startsWith('public/')) {
		candidates.push(`/${normalized.replace(/^public\//, '')}`);
	} else if (normalized.startsWith('pages/') || normalized.startsWith('styles/')) {
		candidates.push(`/${normalized}`);
	} else {
		const baseName = normalized.replace(/\.(html|md)$/, '');
		candidates.push(
			`/pages/${language}/${baseName}.html`,
			`/pages/${language === 'pt' ? 'en' : 'pt'}/${baseName}.html`,
			`/${normalized}`,
		);
	}

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
