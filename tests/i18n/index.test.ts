import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ptTranslation from '../../src/locales/pt/translation.json';
import enTranslation from '../../src/locales/en/translation.json';

jest.mock('i18next', () => ({
    __esModule: true,
    default: {
        use: jest.fn().mockReturnThis(),
        init: jest.fn().mockResolvedValue(undefined),
    },
}));

jest.mock('react-i18next', () => ({
    initReactI18next: jest.fn(),
}));

jest.mock('i18next-browser-languagedetector', () => ({
    __esModule: true,
    default: jest.fn(),
}));

describe('i18n/index.ts', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize i18n with correct configuration', async () => {
        await import('../../src/i18n/index');

        expect(i18n.use).toHaveBeenCalledWith(LanguageDetector);
        expect(i18n.use).toHaveBeenCalledWith(initReactI18next);
        expect(i18n.init).toHaveBeenCalledWith({
            fallbackLng: 'pt',
            debug: false,
            supportedLngs: ['pt', 'en'],
            resources: {
                pt: { translation: ptTranslation },
                en: { translation: enTranslation },
            },
            detection: {
                order: ['localStorage', 'navigator'],
                caches: ['localStorage'],
            },
            interpolation: {
                escapeValue: false,
            },
        });
    });

    it('should export the i18n instance', async () => {
        const { default: i18nInstance } = await import('../../src/i18n/index');
        expect(i18nInstance).toBe(i18n);
    });
});