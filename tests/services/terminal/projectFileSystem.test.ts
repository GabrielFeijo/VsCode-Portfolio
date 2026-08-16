import { buildFileSystem, PROJECT_ROOT } from '../../../src/services/terminal/projectFileSystem';

describe('buildFileSystem', () => {
	it('creates the home directory containing the project root', () => {
		const fs = buildFileSystem({});
		expect(fs['/home/gabriel']).toEqual([{ name: 'vscode-portfolio', type: 'dir' }]);
		expect(fs[PROJECT_ROOT]).toEqual([]);
	});

	it('does not create a home directory when the root has no parent', () => {
		const fs = buildFileSystem({}, '/');
		expect(fs['/']).toEqual([]);
		expect(fs['/home']).toBeUndefined();
	});

	it('builds nested directories with file contents split into lines', () => {
		const fs = buildFileSystem({ 'src/app/index.tsx': 'line1\nline2' });
		expect(fs[`${PROJECT_ROOT}/src`]).toEqual([{ name: 'app', type: 'dir' }]);
		expect(fs[`${PROJECT_ROOT}/src/app`]).toEqual([
			{ name: 'index.tsx', type: 'file', content: ['line1', 'line2'] },
		]);
	});

	it('strips leading ../ prefixes from Vite glob keys', () => {
		const fs = buildFileSystem({ '../../README.md': '# hi' });
		expect(fs[PROJECT_ROOT]).toContainEqual({
			name: 'README.md',
			type: 'file',
			content: ['# hi'],
		});
	});

	it('skips empty keys', () => {
		const fs = buildFileSystem({ '': 'ignored' });
		expect(fs[PROJECT_ROOT]).toEqual([]);
	});

	it('sorts directories before files and alphabetically', () => {
		const fs = buildFileSystem({ 'b.txt': 'x', 'a.txt': 'y', 'src/app.ts': 'z' });
		expect(fs[PROJECT_ROOT].map((entry) => entry.name)).toEqual(['src', 'a.txt', 'b.txt']);
	});

	it('does not duplicate directory entries', () => {
		const fs = buildFileSystem({ 'src/a.ts': '1', 'src/b.ts': '2' });
		expect(fs[PROJECT_ROOT]).toEqual([{ name: 'src', type: 'dir' }]);
	});
});
