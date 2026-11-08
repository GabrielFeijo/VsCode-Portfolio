import { stripFileExtension } from './stripFileExtension';

export function getPageNameAliases(name: string): string[] {
	const baseName = stripFileExtension(name);
	return [name, `${baseName}.md`, `${baseName}.html`];
}

export function isSamePageName(candidate: string, name: string): boolean {
	return getPageNameAliases(name).includes(candidate);
}
