// Browser-only: Vite compiles this import.meta.glob call at build time into a
// static record of the real project text files. Never imported in tests
// (mapped to tests/mocks/projectFilesGlob.ts) so it is excluded from coverage.
export const PROJECT_FILES: Record<string, string> = import.meta.glob(
	[
		'../../../src/**/*.{ts,tsx,css,json,svg}',
		'../../../tests/**/*.{ts,tsx}',
		'../../../public/**/*.{html,css,json,xml,txt,webmanifest,svg,js}',
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
