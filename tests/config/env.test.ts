import { parseEnv } from '../../src/config/env';
import { siteConfig } from '../../src/config/site';

describe('parseEnv', () => {
	it('normalizes VITE_URL and VITE_NAME when provided', () => {
		expect(
			parseEnv({
				VITE_URL: ' https://api.gabrielfeijo.com.br/// ',
				VITE_NAME: ' Custom Name ',
			}),
		).toEqual({
			apiUrl: 'https://api.gabrielfeijo.com.br',
			appName: 'Custom Name',
		});
	});

	it('falls back to safe defaults when env vars are missing or non-strings', () => {
		expect(parseEnv()).toEqual({
			apiUrl: '',
			appName: siteConfig.name,
		});

		expect(parseEnv({ VITE_URL: 123, VITE_NAME: '   ' })).toEqual({
			apiUrl: '',
			appName: siteConfig.name,
		});
	});
});
