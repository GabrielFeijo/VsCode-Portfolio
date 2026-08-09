export const supportedLanguages = ['pt', 'en'] as const;

export type Language = (typeof supportedLanguages)[number];

export interface Page {
	index: number;
	name: string;
	route: string;
	content?: string;
	isSaved?: boolean;
	isFolder?: boolean;
	children?: Page[];
}

export function isLanguage(value: string): value is Language {
	return supportedLanguages.includes(value as Language);
}

export function isPage(value: unknown): value is Page {
	if (typeof value !== 'object' || value === null) return false;

	const page = value as Record<string, unknown>;
	if (
		typeof page.index !== 'number' ||
		!Number.isFinite(page.index) ||
		typeof page.name !== 'string' ||
		typeof page.route !== 'string'
	) {
		return false;
	}

	if (page.content !== undefined && typeof page.content !== 'string') return false;
	if (page.isSaved !== undefined && typeof page.isSaved !== 'boolean') return false;
	if (page.isFolder !== undefined && typeof page.isFolder !== 'boolean') return false;
	if (
		page.children !== undefined &&
		(!Array.isArray(page.children) || !page.children.every(isPage))
	) {
		return false;
	}

	return true;
}
