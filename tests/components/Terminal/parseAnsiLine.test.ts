import { parseAnsiLine } from '../../../src/app/components/Terminal/terminal/parseAnsiLine';

describe('parseAnsiLine', () => {
	it('returns plain text as a single segment', () => {
		const result = parseAnsiLine('hello world', '#cdd6f4', 'dark');

		expect(result).toEqual([{ text: 'hello world', color: '#cdd6f4' }]);
	});

	it('parses ansi color codes into colored segments', () => {
		const result = parseAnsiLine('\x1b[92mgreen\x1b[0m normal', '#cdd6f4', 'dark');

		expect(result).toEqual([
			{ text: 'green', color: '#a6e3a1' },
			{ text: ' normal', color: '#cdd6f4' },
		]);
	});

	it('handles malformed escape sequences gracefully', () => {
		const result = parseAnsiLine('\x1b[invalid', '#cdd6f4', 'dark');

		expect(result[0].text).toContain('\x1b[invalid');
	});

	it('defaults to dark mode when the theme is omitted', () => {
		const result = parseAnsiLine('\x1b[92mgreen\x1b[0m normal', '#cdd6f4');

		expect(result).toEqual([
			{ text: 'green', color: '#a6e3a1' },
			{ text: ' normal', color: '#cdd6f4' },
		]);
	});
});
