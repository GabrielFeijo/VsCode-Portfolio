import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import enTranslation from '../locales/en/translation.json';
import ptTranslation from '../locales/pt/translation.json';

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
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

export default i18n;
