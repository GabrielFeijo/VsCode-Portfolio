import { PROJECT_FILES } from './projectFilesGlob';
import type { VirtualDirectory } from '../../app/components/Terminal/terminal/types';

export const PROJECT_ROOT = '/home/gabriel/vscode-portfolio';

type RawFileMap = Record<string, string>;

const PUBLIC_STATIC_FILES: RawFileMap = {
	'public/robots.txt': 'User-agent: *\nAllow: /\nSitemap: https://gabrielfeijo.com.br/sitemap.xml',
	'public/sitemap.xml': '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>',
	'public/site.webmanifest': '{\n  "name": "Gabriel Feijó Portfolio",\n  "short_name": "Portfolio"\n}',
	'public/styles/about.css': '/* About styles */',
	'public/styles/projects.css': '/* Projects styles */',
	'public/styles/experience.css': '/* Experience styles */',
	'public/styles/certificates.css': '/* Certificates styles */',
	'public/styles/accomplishments.css': '/* Accomplishments styles */',
	'public/pages/pt/sobre-mim.html': '<div>Sobre Mim</div>',
	'public/pages/pt/projetos.html': '<div>Projetos</div>',
	'public/pages/pt/habilidades.html': '<div>Habilidades</div>',
	'public/pages/pt/experiencia.html': '<div>Experiência</div>',
	'public/pages/pt/certificados.html': '<div>Certificados</div>',
	'public/pages/pt/conquistas.html': '<div>Conquistas</div>',
	'public/pages/en/about-me.html': '<div>About Me</div>',
	'public/pages/en/projects.html': '<div>Projects</div>',
	'public/pages/en/skills.html': '<div>Skills</div>',
	'public/pages/en/experience.html': '<div>Experience</div>',
	'public/pages/en/certificates.html': '<div>Certificates</div>',
	'public/pages/en/accomplishments.html': '<div>Accomplishments</div>',
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
