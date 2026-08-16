import { getAppPalette } from '../../../theme/palette';
import { Theme } from '../../../../contexts/ThemeContext';
import { PROJECT_ROOT } from '../../../../services/terminal/projectFileSystem';

export { PROJECT_FS } from '../../../../services/terminal/projectFileSystem';

export const TERMINAL_USER = 'gabriel';
export const TERMINAL_HOST = 'portfolio';
export const TERMINAL_DEFAULT_PATH = PROJECT_ROOT;

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

export const LOCAL_COMMANDS = [
	'help', 'ajuda', 'ls', 'cd', 'pwd', 'whoami', 'date', 'uptime', 'history',
	'echo', 'cat', 'clear', 'limpar', 'neofetch', 'reviews', 'avaliacoes',
	'evaluate', 'avaliar', 'changetheme', 'mudartema', 'changelanguage', 'mudaridioma',
	'route', 'rota', 'theme', 'tema', 'lang', 'idioma', 'matrix', 'cowsay',
	'banner', 'ping', 'curl', 'man', 'exit', 'calc', 'calcular',
] as const;

export const PAGE_ROUTES = [
	'about-me', 'skills', 'projects', 'experience', 'accomplishments', 'certificates',
] as const;
