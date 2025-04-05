'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

i18n
	.use(HttpBackend)
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		fallbackLng: 'pt',
		debug: true,
		supportedLngs: ['pt', 'en'],
		backend: {
			loadPath: '/locales/{{lng}}/translation.json',
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
