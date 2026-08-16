import dayjs from 'dayjs';
import { Language } from '@/domain/page';
import { IRate } from '@/services/api/review/ReviewService';

export function formatUptime(sessionStart: number): string {
	const diff = Date.now() - sessionStart;
	const mins = Math.floor(diff / 60000);
	const secs = Math.floor((diff % 60000) / 1000);
	if (mins > 0) return `${mins} min, ${secs} sec`;
	return `${secs} sec`;
}

export function formatReviews(rates: IRate[], t: (key: string) => string): string[] {
	if (rates.length === 0) {
		return [t('terminal.info.noReviews')];
	}
	return rates.map((rate) => {
		const date = dayjs(rate.createdAt).format('DD/MM/YYYY HH:mm:ss');
		const stars = t(`terminal.rating.${String(rate.stars).replace('.', '_')}`);
		return `\x1b[90m${date}\x1b[0m \x1b[36m[${rate.username}]\x1b[0m ${rate.comment} \x1b[33m★ ${rate.stars}\x1b[0m ${stars}`;
	});
}

interface NeofetchOptions {
	isDark: boolean;
	language: Language;
	uptime: string;
}

export function buildNeofetch({ isDark, language, uptime }: NeofetchOptions): string[] {
	const themeLabel = isDark ? 'Dracula / Catppuccin' : 'Light';
	const langLabel = language === 'pt' ? 'Português (BR)' : 'English (US)';
	return [
		'\x1b[94m       .--.       \x1b[0m  \x1b[92mgabriel\x1b[0m@\x1b[96mportfolio\x1b[0m',
		'\x1b[94m      |o_o |      \x1b[0m  ─────────────────────',
		'\x1b[94m      |:_/ |      \x1b[0m  \x1b[91mOS\x1b[0m: Portfolio Linux x86_64',
		'\x1b[94m     //   \\ \\     \x1b[0m  \x1b[91mHost\x1b[0m: React 18 + Vite 7',
		'\x1b[94m    (|     | )    \x1b[0m  \x1b[91mKernel\x1b[0m: TypeScript 5',
		'\x1b[94m   /\'\\_   _/`\\   \x1b[0m  \x1b[91mShell\x1b[0m: zsh 5.9 (oh-my-zsh)',
		'\x1b[94m   \\___)=(___/    \x1b[0m  \x1b[91mTheme\x1b[0m: ' + themeLabel,
		'                      \x1b[91mLang\x1b[0m: ' + langLabel,
		'                      \x1b[91mUptime\x1b[0m: ' + uptime,
		'                      \x1b[91mPackages\x1b[0m: 37 (npm)',
		'                      \x1b[91mAPI\x1b[0m: NestJS + MongoDB',
	];
}

export function buildHelp(apiCommandList: string[] = []): string[] {
	const apiLine = apiCommandList.length > 0
		? apiCommandList.slice(0, 8).join(', ') + '...'
		: 'help, projects, skills, contact, calc, quote...';

	return [
		'\x1b[1;36m╭─ Portfolio Terminal ──────────────────────────────────╮\x1b[0m',
		'\x1b[1;36m│\x1b[0m \x1b[33mSystem\x1b[0m    ls, cd, pwd, whoami, date, uptime, clear',
		'\x1b[1;36m│\x1b[0m \x1b[33mFiles\x1b[0m     cat, head, tail, tree, grep, wc, touch, mkdir, rm',
		'\x1b[1;36m│\x1b[0m \x1b[33mPortfolio\x1b[0m neofetch, reviews, evaluate, route <page>',
		'\x1b[1;36m│\x1b[0m \x1b[33mSettings\x1b[0m  theme, lang, changelanguage, changetheme',
		'\x1b[1;36m│\x1b[0m \x1b[33mFun\x1b[0m       matrix, cowsay, banner, ping, curl',
		`\x1b[1;36m│\x1b[0m \x1b[33mAPI\x1b[0m       ${apiLine}`,
		'\x1b[1;36m│\x1b[0m \x1b[90mTip: Tab to autocomplete · ↑↓ history · Ctrl+L clear\x1b[0m',
		'\x1b[1;36m╰───────────────────────────────────────────────────────╯\x1b[0m',
	];
}
