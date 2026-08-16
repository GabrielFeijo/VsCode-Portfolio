import { formatFileContent } from '../../../src/app/components/Terminal/terminal/utils/fileFormatter';

describe('fileFormatter', () => {
	it('formats plain content when plain option is true', () => {
		const lines = ['line 1', 'line 2'];
		expect(formatFileContent('test.txt', lines, { plain: true })).toEqual(lines);
	});

	it('formats JSON with highlighting and line numbers', () => {
		const jsonLines = ['{', '  "name": "portfolio",', '  "version": 1,', '  "active": true', '}'];
		const result = formatFileContent('package.json', jsonLines);

		expect(result[1]).toContain('package.json');
		expect(result[1]).toContain('5 lines');
		expect(result[3]).toContain('1 │');
		expect(result[result.length - 1]).toContain('─┴─');
	});

	it('formats TypeScript/JavaScript with syntax highlighting', () => {
		const code = [
			'import React from "react";',
			'// comment line',
			'export const x = 42;',
			'const flag = true;',
		];
		const result = formatFileContent('index.ts', code);
		expect(result[3]).toContain('1 │');
	});

	it('formats HTML and XML with tag highlighting', () => {
		const html = ['<!-- comment -->', '<div class="container">Hello</div>'];
		const result = formatFileContent('index.html', html);
		expect(result[3]).toContain('<!-- comment -->');
	});

	it('formats CSS with property and value highlighting', () => {
		const css = ['/* comment */', '.box { color: red; margin: 10px; }'];
		const result = formatFileContent('style.css', css);
		expect(result[3]).toContain('/* comment */');
	});

	it('formats Markdown with headings and list highlighting', () => {
		const md = ['# Heading', '- Item 1', '`code inline`'];
		const result = formatFileContent('README.md', md);
		expect(result[3]).toContain('# Heading');
	});

	it('formats YAML with key-value highlighting', () => {
		const yml = ['# comment', 'key: value'];
		const result = formatFileContent('config.yml', yml);
		expect(result[4]).toContain('key');
	});

	it('formats general files without extension', () => {
		const lines = ['First line', 'Second line'];
		const result = formatFileContent('LICENSE', lines, { showLineNumbers: false });
		expect(result[3]).toContain('│');
	});

	it('renders full file content without truncation for long files', () => {
		const longLines = Array.from({ length: 200 }, (_, i) => `line ${i + 1}`);
		const result = formatFileContent('large.txt', longLines);

		expect(result[1]).toContain('200 lines');
		expect(result).toHaveLength(204);
	});
});
