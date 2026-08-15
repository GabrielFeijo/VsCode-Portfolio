import { getAppPalette } from '../../../theme/palette';
import { Theme } from '../../../../contexts/ThemeContext';

export const TERMINAL_USER = 'gabriel';
export const TERMINAL_HOST = 'portfolio';
export const TERMINAL_DEFAULT_PATH = '/home/gabriel/vscode-portfolio';

export function getTerminalColors(mode: Theme) {
	const p = getAppPalette(mode);
	return {
		bg: p.terminal.bg,
		bgLight: p.bgPrimary,
		text: p.terminal.text,
		textLight: p.textPrimary,
		user: p.terminal.user,
		host: p.terminal.host,
		path: p.terminal.path,
		arrow: p.terminal.arrow,
		git: p.terminal.git,
		success: p.success,
		error: p.error,
		warning: p.warning,
		info: p.info,
		muted: p.terminal.muted,
		directory: p.accent,
		executable: p.success,
		link: p.accentMuted,
		neofetch: {
			title: p.accent,
			label: p.accentPink,
			value: p.textPrimary,
		},
	};
}

export type TerminalColors = ReturnType<typeof getTerminalColors>;

export interface VirtualFile {
	name: string;
	type: 'file' | 'dir';
	content?: string[];
}

export interface VirtualDirectory {
	[path: string]: VirtualFile[];
}

export const VIRTUAL_FS: VirtualDirectory = {
	'/home/gabriel': [
		{ name: 'vscode-portfolio', type: 'dir' },
	],
	'/home/gabriel/vscode-portfolio': [
		{ name: 'src', type: 'dir' },
		{ name: 'public', type: 'dir' },
		{ name: 'package.json', type: 'file', content: ['{', '  "name": "vscode-portfolio",', '  "version": "1.0.0"', '}'] },
		{ name: 'README.md', type: 'file', content: ['# VsCode Portfolio', '', 'Interactive portfolio by Gabriel Feijó.'] },
		{ name: 'contact.txt', type: 'file', content: [
			'Email: feijo6622@gmail.com',
			'GitHub: github.com/GabrielFeijo',
			'LinkedIn: linkedin.com/in/gabriel-feijo',
			'Website: gabrielfeijo.com.br',
			'Location: Recife, Brazil',
		] },
	],
	'/home/gabriel/vscode-portfolio/src': [
		{ name: 'app', type: 'dir' },
		{ name: 'services', type: 'dir' },
		{ name: 'index.tsx', type: 'file', content: ['import React from "react";', 'import { createRoot } from "react-dom/client";', '', 'createRoot(document.getElementById("root")!).render(<App />);'] },
	],
	'/home/gabriel/vscode-portfolio/src/app': [
		{ name: 'layout', type: 'dir' },
		{ name: 'components', type: 'dir' },
		{ name: 'pages', type: 'dir' },
	],
	'/home/gabriel/vscode-portfolio/src/app/components': [
		{ name: 'Terminal', type: 'dir' },
	],
	'/home/gabriel/vscode-portfolio/src/app/components/Terminal': [
		{ name: 'Cmd.tsx', type: 'file', content: ['// You are here! 👋', 'export default function Cmd() { ... }'] },
	],
	'/home/gabriel/vscode-portfolio/public': [
		{ name: 'pages', type: 'dir' },
		{ name: 'locales', type: 'dir' },
	],
};

export const LOCAL_COMMANDS = [
	'help', 'ajuda', 'ls', 'cd', 'pwd', 'whoami', 'date', 'uptime', 'history',
	'echo', 'cat', 'clear', 'limpar', 'neofetch', 'reviews', 'avaliacoes',
	'evaluate', 'avaliar', 'changetheme', 'mudartema', 'changelanguage', 'mudaridioma',
	'route', 'rota', 'theme', 'tema', 'lang', 'idioma', 'matrix', 'cowsay',
	'banner', 'ping', 'curl', 'man', 'exit',
] as const;

export const PAGE_ROUTES = [
	'about-me', 'skills', 'projects', 'experience', 'accomplishments', 'certificates',
] as const;
