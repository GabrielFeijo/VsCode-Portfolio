import {
	getPreferredBrowserLanguage,
	getStoredLanguagePreference,
	isAutomatedVisitor,
	LANGUAGE_PREFERENCE_KEY,
	setStoredLanguagePreference,
	shouldAutoRedirectToEnglish,
} from '../../src/i18n/languagePreference';

function mockNavigator(overrides: Partial<Navigator>): Navigator {
	return {
		language: 'pt-BR',
		languages: ['pt-BR'],
		userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
		webdriver: false,
		...overrides,
	} as Navigator;
}

describe('languagePreference', () => {
	beforeEach(() => {
		localStorage.clear();
		jest.restoreAllMocks();
	});

	it('reads and writes a valid language preference in localStorage', () => {
		expect(getStoredLanguagePreference()).toBeNull();

		setStoredLanguagePreference('en');
		expect(localStorage.getItem(LANGUAGE_PREFERENCE_KEY)).toBe('en');
		expect(getStoredLanguagePreference()).toBe('en');

		localStorage.setItem(LANGUAGE_PREFERENCE_KEY, 'fr');
		expect(getStoredLanguagePreference()).toBeNull();
	});

	it('tolerates storage access errors', () => {
		jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
			throw new Error('blocked');
		});
		jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
			throw new Error('blocked');
		});

		expect(getStoredLanguagePreference()).toBeNull();
		expect(() => setStoredLanguagePreference('pt')).not.toThrow();
	});

	it('detects automated visitors via webdriver or crawler user agents', () => {
		expect(isAutomatedVisitor(mockNavigator({ webdriver: true }))).toBe(true);
		expect(
			isAutomatedVisitor(
				mockNavigator({
					userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1)',
					languages: ['en-US'],
				}),
			),
		).toBe(true);
		expect(isAutomatedVisitor(mockNavigator({ userAgent: '' }))).toBe(false);
	});

	it('extracts the primary browser language with fallback', () => {
		expect(getPreferredBrowserLanguage(mockNavigator({ languages: [], language: 'en-GB' }))).toBe(
			'en-gb',
		);
		expect(
			getPreferredBrowserLanguage(mockNavigator({ languages: undefined as any, language: '' })),
		).toBe('');
	});

	it('redirects first-time English browser visitors on root path only', () => {
		const enNav = mockNavigator({ languages: ['en-US', 'en'], language: 'en-US' });
		const ptNav = mockNavigator({ languages: ['pt-BR'], language: 'pt-BR' });

		expect(shouldAutoRedirectToEnglish('/', enNav)).toBe(true);
		expect(shouldAutoRedirectToEnglish('/projects', enNav)).toBe(false);
		expect(shouldAutoRedirectToEnglish('/en', enNav)).toBe(false);
		expect(shouldAutoRedirectToEnglish('/', ptNav)).toBe(false);
	});

	it('never redirects when a language preference is saved or visitor is a bot', () => {
		const enNav = mockNavigator({ languages: ['en-US'], language: 'en-US' });
		const botNav = mockNavigator({
			languages: ['en-US'],
			language: 'en-US',
			userAgent: 'Googlebot/2.1',
		});

		expect(shouldAutoRedirectToEnglish('/', botNav)).toBe(false);

		setStoredLanguagePreference('pt');
		expect(shouldAutoRedirectToEnglish('/', enNav)).toBe(false);
	});
});
