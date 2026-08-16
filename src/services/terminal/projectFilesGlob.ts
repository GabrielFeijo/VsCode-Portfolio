export const PROJECT_FILES: Record<string, string> = import.meta.glob(
	[
		'../../../src/**/*.{ts,tsx,css,json,svg,html,md}',
		'../../../tests/**/*.{ts,tsx}',
		'../../../scripts/**/*.{js,mjs}',
		'../../../*.{json,js,cjs,ts,html,md}',
		'../../../.gitignore',
		'../../../.nvmrc',
		'!../../../node_modules/**',
		'!../../../build/**',
		'!../../../coverage/**',
		'!../../../.git/**',
		'!../../../.github/**',
		'!../../../.playwright-mcp/**',
		'!../../../media/**',
		'!../../../package-lock.json',
	],
	{ query: '?raw', eager: true, import: 'default' },
);

