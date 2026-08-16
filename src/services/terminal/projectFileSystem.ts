import { PROJECT_FILES } from './projectFilesGlob';
import type { VirtualDirectory } from '../../app/components/Terminal/terminal/terminalConfig';

export const PROJECT_ROOT = '/home/gabriel/vscode-portfolio';

type RawFileMap = Record<string, string>;

export function buildFileSystem(files: RawFileMap, root = PROJECT_ROOT): VirtualDirectory {
	const fs: VirtualDirectory = { [root]: [] };

	const home = root.slice(0, root.lastIndexOf('/'));
	if (home) {
		fs[home] = [{ name: root.slice(root.lastIndexOf('/') + 1), type: 'dir' }];
	}

	for (const key of Object.keys(files)) {
		const parts = key.replace(/^(\.\.\/)+/, '').split('/').filter(Boolean);
		const fileName = parts.pop();
		if (!fileName) continue;

		let current = root;
		for (const part of parts) {
			const next = `${current}/${part}`;
			const entries = (fs[current] ??= []);
			if (!entries.some((entry) => entry.name === part && entry.type === 'dir')) {
				entries.push({ name: part, type: 'dir' });
			}
			current = next;
		}

		(fs[current] ??= []).push({
			name: fileName,
			type: 'file',
			content: files[key].split('\n'),
		});
	}

	for (const path of Object.keys(fs)) {
		fs[path].sort((a, b) => {
			if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
			return a.name.localeCompare(b.name);
		});
	}

	return fs;
}

export const PROJECT_FS: VirtualDirectory = buildFileSystem(PROJECT_FILES);
