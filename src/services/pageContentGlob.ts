export const PAGE_FILES: Record<string, string> = import.meta.glob(
	'../pages/**/*.{html,md}',
	{ query: '?raw', eager: true, import: 'default' }
);
