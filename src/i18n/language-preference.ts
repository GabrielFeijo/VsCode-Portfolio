import { normalizeSeoPath } from '../config/seo';
import { isLanguage, type Language } from '../domain/page';

export const LANGUAGE_PREFERENCE_KEY = 'portfolio:lang';

const BOT_USER_AGENT_PATTERN = /bot|crawl|spider|slurp|lighthouse|headless|prerender/i;

export function getStoredLanguagePreference(): Language | null {
	try {
		const value = localStorage.getItem(LANGUAGE_PREFERENCE_KEY);
		return value && isLanguage(value) ? value : null;
	} catch {
		return null;
	}
}

export function setStoredLanguagePreference(language: Language): void {
	try {
		localStorage.setItem(LANGUAGE_PREFERENCE_KEY, language);
	} catch {}
}

export function isAutomatedVisitor(nav: Navigator = navigator): boolean {
	if (nav.webdriver) return true;
	return BOT_USER_AGENT_PATTERN.test(nav.userAgent || '');
}

export function getPreferredBrowserLanguage(nav: Navigator = navigator): string {
	const primary = nav.languages?.[0] || nav.language || '';
	return primary.toLowerCase();
}

export function shouldAutoRedirectToEnglish(pathname: string, nav: Navigator = navigator): boolean {
	if (normalizeSeoPath(pathname) !== '/') return false;
	if (getStoredLanguagePreference() !== null) return false;
	if (isAutomatedVisitor(nav)) return false;

	const preferred = getPreferredBrowserLanguage(nav);
	return preferred.startsWith('en');
}
