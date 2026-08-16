import { PROJECT_FILES } from './projectFilesGlob';
import type { VirtualDirectory } from '../../app/components/Terminal/terminal/types';

export const PROJECT_ROOT = '/home/gabriel/vscode-portfolio';

type RawFileMap = Record<string, string>;

const STATIC_STRUCTURE_ENTRIES: RawFileMap = {
	'public/robots.txt': '',
	'public/sitemap.xml': '',
	'public/site.webmanifest': '',
	'public/styles/about.css': '',
	'public/styles/projects.css': '',
	'public/styles/experience.css': '',
	'public/styles/certificates.css': '',
	'public/styles/accomplishments.css': '',
	'public/pages/pt/sobre-mim.html': '',
	'public/pages/pt/projetos.html': '',
	'public/pages/pt/habilidades.html': '',
	'public/pages/pt/experiencia.html': '',
	'public/pages/pt/certificados.html': '',
	'public/pages/pt/conquistas.html': '',
	'public/pages/en/about-me.html': '',
	'public/pages/en/projects.html': '',
	'public/pages/en/skills.html': '',
	'public/pages/en/experience.html': '',
	'public/pages/en/certificates.html': '',
	'public/pages/en/accomplishments.html': '',
	'sobre-mim.html': '',
	'projetos.html': '',
	'habilidades.html': '',
	'experiencia.html': '',
	'conquistas.html': '',
	'certificados.html': '',
	'sobre-mim.md': '',
	'projetos.md': '',
	'habilidades.md': '',
	'experiencia.md': '',
	'conquistas.md': '',
	'certificados.md': '',
	'about-me.html': '',
	'projects.html': '',
	'skills.html': '',
	'experience.html': '',
	'accomplishments.html': '',
	'certificates.html': '',
	'about-me.md': '',
	'projects.md': '',
	'skills.md': '',
	'experience.md': '',
	'accomplishments.md': '',
	'certificates.md': '',
};

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

		const content = files[key] ? files[key].split('\n') : undefined;
		(fs[current] ??= []).push({
			name: fileName,
			type: 'file',
			content,
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

export const PROJECT_FS: VirtualDirectory = buildFileSystem({ ...STATIC_STRUCTURE_ENTRIES, ...PROJECT_FILES });
