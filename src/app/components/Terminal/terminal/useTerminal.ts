import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../contexts/ThemeContext';
import { Language } from '../../../../domain/page';
import { getLocalizedPath } from '../../../../config/seo';
import { CommandService } from '../../../../services/api/command/CommandService';
import { IRate, ReviewService } from '../../../../services/api/review/ReviewService';
import {
	LOCAL_COMMANDS,
	PAGE_ROUTES,
	PROJECT_FS,
	TERMINAL_DEFAULT_PATH,
	getTerminalColors,
} from './terminalConfig';

export interface TerminalEntry {
	id: string;
	command: string;
	response: string[];
	color?: string;
	cwd: string;
}

interface UseTerminalOptions {
	language: Language;
	setRanking: React.Dispatch<React.SetStateAction<boolean>>;
	changeLanguage: () => void;
}

const SESSION_START = Date.now();
let entryCounter = 0;

function nextId(): string {
	entryCounter += 1;
	return `entry-${entryCounter}`;
}

function normalizePath(base: string, target: string): string {
	if (target === '~') return '/home/gabriel';
	if (target.startsWith('~/')) {
		return normalizePath('/home/gabriel', target.slice(2));
	}
	if (target.startsWith('/')) return target.replace(/\/+$/, '') || '/';

	const parts = base.split('/').filter(Boolean);
	for (const segment of target.split('/')) {
		if (segment === '' || segment === '.') continue;
		if (segment === '..') {
			parts.pop();
			continue;
		}
		parts.push(segment);
	}
	return '/' + parts.join('/');
}

function listDirectory(path: string): string[] {
	const entries = PROJECT_FS[path];

	return entries.map((entry) => {
		const suffix = entry.type === 'dir' ? '/' : '';
		const color = entry.type === 'dir' ? '\x1b[94m' : '\x1b[92m';
		return `${color}${entry.name}${suffix}\x1b[0m`;
	});
}

const PATH_COMMANDS = ['cd', 'cat', 'ls', 'echo'];

function completePathArgument(arg: string, cwd: string): string[] {
	const lastSlash = arg.lastIndexOf('/');
	const base = lastSlash >= 0 ? arg.slice(0, lastSlash + 1) : '';
	const prefix = lastSlash >= 0 ? arg.slice(lastSlash + 1) : arg;

	const dirPath = base.startsWith('/')
		? base.replace(/\/+$/, '') || '/'
		: base
			? normalizePath(cwd, base)
			: cwd;

	const entries = PROJECT_FS[dirPath];
	if (!entries) return [];

	return entries
		.filter((entry) => entry.name.startsWith(prefix))
		.map((entry) => base + entry.name + (entry.type === 'dir' ? '/' : ''));
}

function calculate(expression: string): number | null {
	const tokens: string[] = [];
	let i = 0;

	while (i < expression.length) {
		const ch = expression[i];
		if (/\s/.test(ch)) {
			i += 1;
			continue;
		}
		if (/[0-9.]/.test(ch)) {
			let num = '';
			while (i < expression.length && /[0-9.]/.test(expression[i])) {
				num += expression[i];
				i += 1;
			}
			tokens.push(num);
			continue;
		}
		if ('+-*/%^()'.includes(ch)) {
			tokens.push(ch);
			i += 1;
			continue;
		}
		return null;
	}

	let pos = 0;
	const peek = (): string | undefined => tokens[pos];
	const next = (): string | undefined => tokens[pos++];

	function parseFactor(): number {
		const token = next();
		if (token === '(') {
			const value = parseExpression();
			if (peek() !== ')') return NaN;
			next();
			return value;
		}
		if (token === '+' || token === '-') {
			const value = parseFactor();
			return token === '-' ? -value : value;
		}
		const num = Number(token);
		return Number.isFinite(num) ? num : NaN;
	}

	function parsePower(): number {
		const value = parseFactor();
		if (peek() === '^') {
			next();
			return Math.pow(value, parsePower());
		}
		return value;
	}

	function parseTerm(): number {
		let value = parsePower();
		while (peek() === '*' || peek() === '/' || peek() === '%') {
			const op = next();
			const rhs = parsePower();
			if (op === '*') value *= rhs;
			else if (op === '/') value = rhs === 0 ? NaN : value / rhs;
			else value %= rhs;
		}
		return value;
	}

	function parseExpression(): number {
		let value = parseTerm();
		while (peek() === '+' || peek() === '-') {
			const op = next();
			const rhs = parseTerm();
			value = op === '+' ? value + rhs : value - rhs;
		}
		return value;
	}

	if (tokens.length === 0) return null;

	const result = parseExpression();
	if (pos !== tokens.length || Number.isNaN(result) || !Number.isFinite(result)) {
		return null;
	}
	return result;
}

function formatResult(value: number): string {
	return Number.isInteger(value) ? String(value) : String(parseFloat(value.toFixed(6)));
}

export function useTerminal({ language, setRanking, changeLanguage }: UseTerminalOptions) {
	const { t } = useTranslation();
	const { theme, toggleTheme } = useTheme();
	const navigate = useNavigate();
	const terminalColors = getTerminalColors(theme);
	const [cwd, setCwd] = useState(TERMINAL_DEFAULT_PATH);
	const [entries, setEntries] = useState<TerminalEntry[]>([]);
	const [command, setCommand] = useState('');
	const commandRef = useRef('');
	const [history, setHistory] = useState<string[]>([]);
	const historyRef = useRef<string[]>([]);
	const [historyIndex, setHistoryIndex] = useState(-1);
	const [apiCommands, setApiCommands] = useState<string[]>([]);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);

	const isDark = theme === 'dark';

	useEffect(() => {
		CommandService.findAll().then((data) => {
			if (!(data instanceof Error)) {
				setApiCommands(data.map((c) => c.command));
			}
		});
	}, []);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [entries, command]);

	const addEntry = useCallback(
		(cmd: string, response: string[], color?: string, entryCwd = cwd) => {
			setEntries((prev) => [
				...prev,
				{ id: nextId(), command: cmd, response, color, cwd: entryCwd },
			]);
		},
		[cwd],
	);

	const formatReviews = (rates: IRate[]): string[] => {
		if (rates.length === 0) {
			return [t('terminal.info.noReviews')];
		}
		return rates.map((rate) => {
			const date = dayjs(rate.createdAt).format('DD/MM/YYYY HH:mm:ss');
			const stars = t(`terminal.rating.${String(rate.stars).replace('.', '_')}`);
			return `\x1b[90m${date}\x1b[0m \x1b[36m[${rate.username}]\x1b[0m ${rate.comment} \x1b[33m★ ${rate.stars}\x1b[0m ${stars}`;
		});
	};

	const buildNeofetch = (): string[] => {
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
			'                      \x1b[91mUptime\x1b[0m: ' + formatUptime(),
			'                      \x1b[91mPackages\x1b[0m: 37 (npm)',
			'                      \x1b[91mAPI\x1b[0m: NestJS + MongoDB',
		];
	};

	const formatUptime = (): string => {
		const diff = Date.now() - SESSION_START;
		const mins = Math.floor(diff / 60000);
		const secs = Math.floor((diff % 60000) / 1000);
		if (mins > 0) return `${mins} min, ${secs} sec`;
		return `${secs} sec`;
	};

	const buildHelp = (): string[] => {
		return [
			'\x1b[1;36m╭─ Portfolio Terminal ─────────────────────────────╮\x1b[0m',
			'\x1b[1;36m│\x1b[0m \x1b[33mSystem\x1b[0m    ls, cd, pwd, whoami, date, uptime, clear',
			'\x1b[1;36m│\x1b[0m \x1b[33mFiles\x1b[0m     cat <file>, echo <text>',
			'\x1b[1;36m│\x1b[0m \x1b[33mPortfolio\x1b[0m neofetch, reviews, evaluate, route <page>',
			'\x1b[1;36m│\x1b[0m \x1b[33mSettings\x1b[0m  theme, lang, changelanguage, changetheme',
			'\x1b[1;36m│\x1b[0m \x1b[33mFun\x1b[0m       matrix, cowsay, banner, ping, curl',
			'\x1b[1;36m│\x1b[0m \x1b[33mAPI\x1b[0m       help, projects, skills, contact, calc, quote...',
			'\x1b[1;36m│\x1b[0m \x1b[90mTip: Tab to autocomplete · ↑↓ history · Ctrl+L clear\x1b[0m',
			'\x1b[1;36m╰──────────────────────────────────────────────────╯\x1b[0m',
		];
	};

	const executeLocal = async (rawCommand: string): Promise<boolean> => {
		const trimmed = rawCommand.trim();
		const lower = trimmed.toLowerCase();
		const spaceIdx = trimmed.indexOf(' ');
		const cmd = spaceIdx > 0 ? lower.substring(0, spaceIdx) : lower;
		const arg = spaceIdx > 0 ? trimmed.substring(spaceIdx + 1) : '';

		switch (cmd) {
			case 'help':
			case 'ajuda':
				addEntry(trimmed, buildHelp());
				return true;

			case 'clear':
			case 'limpar':
				setEntries([]);
				return true;

			case 'ls':
				addEntry(trimmed, listDirectory(cwd));
				return true;

			case 'pwd':
				addEntry(trimmed, [cwd]);
				return true;

			case 'whoami':
				addEntry(trimmed, ['gabriel']);
				return true;

			case 'date':
				addEntry(trimmed, [new Date().toLocaleString(language === 'pt' ? 'pt-BR' : 'en-US')]);
				return true;

			case 'uptime':
				addEntry(trimmed, [`\x1b[92m up ${formatUptime()}\x1b[0m`]);
				return true;

			case 'history':
				if (historyRef.current.length === 0) {
					addEntry(trimmed, [t('terminal.info.emptyHistory')]);
				} else {
					addEntry(
						trimmed,
						historyRef.current.map((h, i) => `\x1b[90m${String(i + 1).padStart(4)}\x1b[0m  ${h}`),
					);
				}
				return true;

			case 'echo':
				addEntry(trimmed, [arg || '']);
				return true;

			case 'calc':
			case 'calcular': {
				if (!arg) {
					addEntry(trimmed, [
						'\x1b[33mUsage: calc <expression>\x1b[0m',
						'\x1b[90m  e.g. calc 2 + 2 * 3  ·  calc (10 - 4) / 2  ·  calc 2^8\x1b[0m',
					]);
					return true;
				}
				const result = calculate(arg);
				if (result === null) {
					addEntry(trimmed, [`\x1b[91mcalc: invalid expression: ${arg}\x1b[0m`], terminalColors.error);
					return true;
				}
				addEntry(trimmed, [`${arg} = \x1b[92m${formatResult(result)}\x1b[0m`]);
				return true;
			}

			case 'neofetch':
				addEntry(trimmed, buildNeofetch());
				return true;

			case 'theme':
			case 'tema':
			case 'changetheme':
			case 'mudartema':
				toggleTheme();
				addEntry(trimmed, [`\x1b[92m✓\x1b[0m ${t('terminal.info.theme')}`]);
				return true;

			case 'lang':
			case 'idioma':
			case 'changelanguage':
			case 'mudaridioma':
				changeLanguage();
				addEntry(trimmed, [`\x1b[92m✓\x1b[0m ${t('terminal.info.language')}`]);
				return true;

			case 'reviews':
			case 'avaliacoes': {
				const data = await ReviewService.findAll();
				if (data instanceof Error) {
					addEntry(trimmed, [`\x1b[91m✗\x1b[0m ${t('terminal.info.errorShort')}`], terminalColors.error);
					return true;
				}
				addEntry(trimmed, ['', ...formatReviews(data)]);
				return true;
			}

			case 'evaluate':
			case 'avaliar':
				setRanking(true);
				addEntry(trimmed, [`\x1b[92m→\x1b[0m ${t('terminal.info.openRating')}`]);
				return true;

			case 'route':
			case 'rota': {
				const route = arg.toLowerCase();
				if (!PAGE_ROUTES.includes(route as (typeof PAGE_ROUTES)[number])) {
					addEntry(trimmed, [
						`\x1b[91m✗\x1b[0m ${t('terminal.info.invalidRoute')}`,
						`\x1b[90m  ${PAGE_ROUTES.join(', ')}\x1b[0m`,
					]);
					return true;
				}
				navigate(getLocalizedPath(`/${route}`, language));
				addEntry(trimmed, [`\x1b[92m→\x1b[0m ${t('terminal.info.navigating', { route })}`]);
				return true;
			}

			case 'cd': {
				if (!arg) {
					setCwd('/home/gabriel');
					return true;
				}
			const newPath = normalizePath(cwd, arg);
			if (!PROJECT_FS[newPath]) {
					addEntry(trimmed, [`\x1b[91mcd: ${arg}: No such file or directory\x1b[0m`], terminalColors.error);
					return true;
				}
				setCwd(newPath);
				return true;
			}

			case 'cat': {
				if (!arg) {
					addEntry(trimmed, ['\x1b[33mUsage: cat <filename>\x1b[0m']);
					return true;
				}
				const filePath = normalizePath(cwd, arg);
				const parent = filePath.substring(0, filePath.lastIndexOf('/')) || '/';
				const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
				const dirEntries = PROJECT_FS[parent];
				const file = dirEntries?.find((e) => e.name === fileName && e.type === 'file');
				if (!file?.content) {
					addEntry(trimmed, [`\x1b[91mcat: ${arg}: No such file\x1b[0m`], terminalColors.error);
					return true;
				}
				addEntry(trimmed, file.content);
				return true;
			}

			case 'matrix':
				addEntry(trimmed, [
					'\x1b[92mWake up, Neo...\x1b[0m',
					'\x1b[92mThe Matrix has you...\x1b[0m',
					'\x1b[92mFollow the white rabbit. 🐇\x1b[0m',
					'\x1b[90m01001000 01100101 01101100 01101100 01101111\x1b[0m',
				]);
				return true;

			case 'cowsay': {
				const msg = arg || 'Moo! I am a terminal cow.';
				const border = '─'.repeat(msg.length + 2);
				addEntry(trimmed, [
					` ${border}`,
					`< ${msg} >`,
					` ${border}`,
					'        \\   ^__^',
					'         \\  (oo)\\_______',
					'            (__)\\       )\\/\\',
					'                ||----w |',
					'                ||     ||',
				]);
				return true;
			}

			case 'banner': {
				const text = arg || 'GABRIEL';
				const line = '═'.repeat(text.length + 4);
				addEntry(trimmed, [
					`\x1b[96m╔${line}╗\x1b[0m`,
					`\x1b[96m║\x1b[0m  \x1b[93m${text}\x1b[0m  \x1b[96m║\x1b[0m`,
					`\x1b[96m╚${line}╝\x1b[0m`,
				]);
				return true;
			}

			case 'ping': {
				const host = arg || 'api.gabrielfeijo.com.br';
				addEntry(trimmed, [
					`PING ${host} (127.0.0.1): 56 data bytes`,
					`\x1b[92m64 bytes from ${host}: icmp_seq=0 ttl=64 time=0.42 ms\x1b[0m`,
					`\x1b[92m64 bytes from ${host}: icmp_seq=1 ttl=64 time=0.38 ms\x1b[0m`,
					`\x1b[92m64 bytes from ${host}: icmp_seq=2 ttl=64 time=0.41 ms\x1b[0m`,
					`--- ${host} ping statistics ---`,
					`3 packets transmitted, 3 received, 0% packet loss`,
				]);
				return true;
			}

			case 'curl': {
				const url = arg || 'https://api.gabrielfeijo.com.br/v2/';
				addEntry(trimmed, [
					`\x1b[90m> GET ${url}\x1b[0m`,
					`\x1b[92m< HTTP/1.1 200 OK\x1b[0m`,
					`\x1b[90m< content-type: application/json\x1b[0m`,
					`"Hello World!"`,
				]);
				return true;
			}

			case 'man': {
				const manCmd = arg.toLowerCase() || 'help';
				addEntry(trimmed, [
					`\x1b[1m${manCmd.toUpperCase()}(1)\x1b[0m`,
					`NAME`,
					`    ${manCmd} - portfolio terminal command`,
					``,
					`SYNOPSIS`,
					`    ${manCmd} [options]`,
					``,
					`DESCRIPTION`,
					`    Type 'help' for full command list.`,
				]);
				return true;
			}

			case 'exit':
				addEntry(trimmed, [t('terminal.info.exitHint')]);
				return true;

			default:
				return false;
		}
	};

	const executeCommand = async (rawCommand: string): Promise<void> => {
		const trimmed = rawCommand.trim();
		if (trimmed.length <= 1) return;

		setHistory((prev) => {
			const next = [...prev.filter((h) => h !== trimmed), trimmed];
			historyRef.current = next;
			return next;
		});
		setHistoryIndex(-1);

		const handled = await executeLocal(trimmed);
		if (handled) return;

		const apiCommand = trimmed.toLowerCase().startsWith('ajuda') ? 'help' : trimmed;
		const responseData = await CommandService.getResponse(apiCommand);

		if (responseData instanceof Error) {
			addEntry(trimmed, [
				`\x1b[91mzsh: command not found: ${trimmed.split(' ')[0]}\x1b[0m`,
				`\x1b[90mType 'help' for available commands\x1b[0m`,
			], terminalColors.error);
			return;
		}

		addEntry(trimmed, responseData.response);
	};

	const allCommands = Array.from(new Set([...LOCAL_COMMANDS, ...apiCommands]));

	const getCompletionState = (
		input: string,
	): { value: string | null; candidates: string[]; list: string[]; isPath: boolean } => {
		if (!input) return { value: null, candidates: [], list: [], isPath: false };
		const trimmed = input.trim();
		const spaceIdx = trimmed.indexOf(' ');
		const cmd = spaceIdx > 0 ? trimmed.slice(0, spaceIdx).toLowerCase() : '';
		const arg = spaceIdx > 0 ? trimmed.slice(spaceIdx + 1) : '';
		const isPath = PATH_COMMANDS.includes(cmd);

		const raw = isPath
			? completePathArgument(arg, cwd)
			: allCommands.filter((c) => c.startsWith(trimmed.toLowerCase()));

		if (raw.length === 0) return { value: null, candidates: [], list: [], isPath };
		const candidates = isPath ? raw.map((c) => `${cmd} ${c}`) : raw;

		if (raw.length === 1) {
			const full = candidates[0];
			const value = isPath && full.endsWith('/') ? full : full + ' ';
			return { value, candidates, list: raw, isPath };
		}
		return { value: null, candidates, list: raw, isPath };
	};

	const getCompletions = (input: string): string[] => getCompletionState(input).candidates;

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'l' && e.ctrlKey) {
			e.preventDefault();
			setEntries([]);
			return;
		}

		if (e.key === 'Tab') {
			e.preventDefault();
			const state = getCompletionState(command);
			if (state.value !== null) {
				commandRef.current = state.value;
				setCommand(state.value);
			} else if (state.list.length > 1 && command.trim() !== '') {
				const lines = state.isPath
					? state.list.map((c) =>
							c.endsWith('/') ? `\x1b[94m${c}\x1b[0m` : `\x1b[92m${c}\x1b[0m`,
						)
					: state.list.map((c) => `\x1b[94m${c}\x1b[0m`);
				addEntry(`${command.trim()} <TAB>`, ['', ...lines]);
			}
			return;
		}

		if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (history.length === 0) return;
			const newIndex = historyIndex < 0 ? history.length - 1 : Math.max(0, historyIndex - 1);
			setHistoryIndex(newIndex);
			commandRef.current = history[newIndex];
			setCommand(history[newIndex]);
			return;
		}

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (historyIndex < 0) return;
			const newIndex = historyIndex + 1;
			if (newIndex >= history.length) {
				setHistoryIndex(-1);
				commandRef.current = '';
				setCommand('');
			} else {
				setHistoryIndex(newIndex);
				commandRef.current = history[newIndex];
				setCommand(history[newIndex]);
			}
		}
	};

	const submitCommand = async () => {
		const current = commandRef.current;
		commandRef.current = '';
		setCommand('');
		await executeCommand(current);
	};

	const setCommandValue = (value: string) => {
		commandRef.current = value;
		setCommand(value);
	};

	return {
		cwd,
		entries,
		command,
		setCommand: setCommandValue,
		history,
		isDark,
		inputRef,
		scrollRef,
		handleKeyDown,
		submitCommand,
		getCompletions,
	};
}
