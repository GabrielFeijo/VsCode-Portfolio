export const STYLE_FILES: Record<string, string> = import.meta.glob(
	'../styles/*.css',
	{ query: '?raw', eager: true, import: 'default' }
);
