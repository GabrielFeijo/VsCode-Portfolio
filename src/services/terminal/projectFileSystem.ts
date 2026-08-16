import { PROJECT_FILES } from './projectFilesGlob';
import { PUBLIC_STATIC_FILES } from './pageStaticContents';
import type { VirtualDirectory } from '../../app/components/Terminal/terminal/types';

export const PROJECT_ROOT = '/home/gabriel/vscode-portfolio';

type RawFileMap = Record<string, string>;

export function buildFileSystem(files: RawFileMap, root = PROJECT_ROOT): VirtualDirectory {
	const fs: VirtualDirectory = { '/': [], [root]: [] };

	const rootParts = root.split('/').filter(Boolean);
	let currentAncestor = '';
	for (let i = 0; i < rootParts.length; i++) {
		const parentPath = currentAncestor === '' ? '/' : currentAncestor;
		const childName = rootParts[i];
		const nextAncestor = `${currentAncestor}/${childName}`;

		fs[parentPath] ??= [];
		if (!fs[parentPath].some((e) => e.name === childName && e.type === 'dir')) {
			fs[parentPath].push({ name: childName, type: 'dir' });
		}
		fs[nextAncestor] ??= [];
		currentAncestor = nextAncestor;
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

export const PROJECT_FS: VirtualDirectory = buildFileSystem({ ...PUBLIC_STATIC_FILES, ...PROJECT_FILES });
