import { siteConfig } from './site';

export interface AppEnv {
	apiUrl: string;
	appName: string;
}

export function parseEnv(raw: Record<string, unknown> = {}): AppEnv {
	const rawUrl = typeof raw.VITE_URL === 'string' ? raw.VITE_URL.trim().replace(/\/+$/, '') : '';
	const rawName = typeof raw.VITE_NAME === 'string' ? raw.VITE_NAME.trim() : '';

	return {
		apiUrl: rawUrl,
		appName: rawName || siteConfig.name,
	};
}
