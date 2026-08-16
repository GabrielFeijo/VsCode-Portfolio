import {
	completePathArgument,
	formatLsEntry,
	generateTree,
	listDirectory,
	normalizePath,
} from '../../../src/app/components/Terminal/terminal/utils/pathUtils';
import { VirtualDirectory } from '../../../src/app/components/Terminal/terminal/types';

describe('pathUtils', () => {
	const mockFs: VirtualDirectory = {
		'/home/gabriel': [
			{ name: 'vscode-portfolio', type: 'dir' },
			{ name: 'notes.txt', type: 'file', content: ['note content'] },
		],
		'/home/gabriel/vscode-portfolio': [
			{ name: 'src', type: 'dir' },
			{ name: 'package.json', type: 'file', content: ['{}'] },
		],
	};

	describe('normalizePath', () => {
		it('normalizes home directory tilde', () => {
			expect(normalizePath('/home/gabriel/vscode-portfolio', '~')).toBe('/home/gabriel');
			expect(normalizePath('/home/gabriel', '~/vscode-portfolio')).toBe(
				'/home/gabriel/vscode-portfolio',
			);
		});

		it('normalizes absolute and relative paths with dots', () => {
			expect(normalizePath('/home/gabriel', '/etc/hosts/')).toBe('/etc/hosts');
			expect(normalizePath('/home/gabriel', '/')).toBe('/');
			expect(normalizePath('/home/gabriel/vscode-portfolio', '..')).toBe('/home/gabriel');
			expect(normalizePath('/home/gabriel', './vscode-portfolio/src')).toBe(
				'/home/gabriel/vscode-portfolio/src',
			);
		});
	});

	describe('listDirectory', () => {
		it('returns colored formatted entries', () => {
			const result = listDirectory('', '/home/gabriel', mockFs);
			expect(result.lines).toHaveLength(2);
			expect(result.lines?.[0]).toContain('vscode-portfolio/');
			expect(result.lines?.[1]).toContain('notes.txt');
		});

		it('supports long listing and hidden files options', () => {
			const result = listDirectory('', '/home/gabriel', mockFs, { showAll: true, longListing: true });
			expect(result.lines).toHaveLength(4);
			expect(result.lines?.[0]).toContain('.');
			expect(result.lines?.[1]).toContain('..');
			expect(result.lines?.[2]).toContain('drwxr-xr-x');
		});

		it('returns error when path is not in filesystem', () => {
			const result = listDirectory('/non/existing', '/home/gabriel', mockFs);
			expect(result.error).toContain('No such file or directory');

			const emptyArgResult = listDirectory('', '/nonexistent-cwd', {});
			expect(emptyArgResult.error).toContain('No such file or directory');
		});

		it('lists single file directly if target is a file and formats file without content', () => {
			const result = listDirectory('notes.txt', '/home/gabriel', mockFs, { longListing: true });
			expect(result.lines).toHaveLength(1);
			expect(result.lines?.[0]).toContain('notes.txt');

			const fileWithoutContent = formatLsEntry({ name: 'empty.txt', type: 'file' }, true);
			expect(fileWithoutContent).toContain('-rw-r--r--');
		});
	});

	describe('generateTree', () => {
		it('generates ASCII tree lines for a directory', () => {
			const tree = generateTree('', '/home/gabriel', mockFs);
			expect(tree.lines?.some((l) => l.includes('vscode-portfolio'))).toBe(true);
			expect(tree.lines?.some((l) => l.includes('notes.txt'))).toBe(true);
		});

		it('returns error when target directory does not exist', () => {
			const tree = generateTree('nonexistent', '/home/gabriel', mockFs);
			expect(tree.error).toContain('No such directory');

			const emptyArgTree = generateTree('', '/nonexistent-cwd', {});
			expect(emptyArgTree.error).toContain('No such directory');
		});
	});

	describe('completePathArgument', () => {
		it('completes relative and prefixed arguments', () => {
			const completions = completePathArgument('pack', '/home/gabriel/vscode-portfolio', mockFs);
			expect(completions).toEqual(['package.json']);
		});

		it('completes subdirectory paths', () => {
			const completions = completePathArgument('vscode-portfolio/', '/home/gabriel', mockFs);
			expect(completions).toEqual(['vscode-portfolio/src/', 'vscode-portfolio/package.json']);
		});

		it('returns empty array when base directory does not exist', () => {
			expect(completePathArgument('xyz', '/unknown/dir', mockFs)).toEqual([]);
		});
	});
});
