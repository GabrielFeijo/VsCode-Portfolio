import { Language } from '@/domain/page';
import { getLocalizedPath } from '@/config/seo';
import { ReviewService } from '@/services/api/review/ReviewService';
import { StorageService } from '@/services/storageService';
import { PAGE_ROUTES, PROJECT_FS, PROJECT_ROOT } from './terminalConfig';
import { ActiveEditorSession, TerminalColors, TerminalEntry, VirtualDirectory } from './types';
import { calculate, formatResult } from './utils/calculator';
import { generateTree, listDirectory, normalizePath } from './utils/pathUtils';
import { buildHelp, buildNeofetch, formatReviews, formatUptime } from './utils/formatters';
import { formatFileContent } from './utils/fileFormatter';

export interface CommandExecutionContext {
	language: Language;
	cwd: string;
	setCwd: (cwd: string) => void;
	previousCwd: string;
	setPreviousCwd: (cwd: string) => void;
	addEntry: (cmd: string, response: string[], color?: string, entryCwd?: string) => void;
	clearEntries: () => void;
	history: string[];
	toggleTheme: () => void;
	changeLanguage: () => void;
	setRanking: React.Dispatch<React.SetStateAction<boolean>>;
	navigate: (path: string) => void;
	terminalColors: TerminalColors;
	t: (key: string, opts?: Record<string, unknown>) => string;
	sessionStart: number;
	isDark: boolean;
	fs: VirtualDirectory;
	setFs: React.Dispatch<React.SetStateAction<VirtualDirectory>>;
	apiCommandList?: string[];
	openEditor?: (session: ActiveEditorSession) => void;
}

function parseFlagsAndArgs(rawArgs: string): { flags: Set<string>; args: string[] } {
	const tokens = rawArgs.split(/\s+/).filter(Boolean);
	const flags = new Set<string>();
	const args: string[] = [];

	for (const token of tokens) {
		if (token.startsWith('-') && token.length > 1 && !/^[0-9]/.test(token.slice(1))) {
			for (const char of token.slice(1)) {
				flags.add(char);
			}
		} else {
			args.push(token.replace(/^["']|["']$/g, ''));
		}
	}

	return { flags, args };
}

function getFileLines(fs: VirtualDirectory, parent: string, fileName: string): string[] | null {
	const baseName = fileName.replace(/\.(html|md)$/, '');
	const stored = StorageService.getData().find(
		(p) =>
			p.name === fileName ||
			p.name === `${baseName}.md` ||
			p.name === `${baseName}.html` ||
			p.name === baseName ||
			p.route === baseName,
	);
	if (stored?.content !== undefined) {
		return stored.content.split('\n');
	}

	const exact = fs[parent]?.find((e) => e.name === fileName && e.type === 'file');
	if (exact?.content) {
		return exact.content;
	}

	const altHtml = fs[parent]?.find((e) => e.name === `${baseName}.html` && e.type === 'file');
	if (altHtml?.content) {
		return altHtml.content;
	}

	const altMd = fs[parent]?.find((e) => e.name === `${baseName}.md` && e.type === 'file');
	if (altMd?.content) {
		return altMd.content;
	}

	return null;
}

export async function executeLocalCommand(
	rawCommand: string,
	ctx: CommandExecutionContext,
): Promise<boolean> {
	const trimmed = rawCommand.trim();
	const lower = trimmed.toLowerCase();
	const spaceIdx = trimmed.indexOf(' ');
	const cmd = spaceIdx > 0 ? lower.substring(0, spaceIdx) : lower;
	const arg = spaceIdx > 0 ? trimmed.substring(spaceIdx + 1) : '';

	const {
		language,
		cwd,
		setCwd,
		previousCwd,
		setPreviousCwd,
		addEntry,
		clearEntries,
		history,
		toggleTheme,
		changeLanguage,
		setRanking,
		navigate,
		terminalColors,
		t,
		sessionStart,
		isDark,
		fs,
		setFs,
		apiCommandList = [],
	} = ctx;

	switch (cmd) {
		case 'help':
		case 'ajuda':
			addEntry(trimmed, buildHelp(apiCommandList));
			return true;

		case 'clear':
		case 'limpar':
			clearEntries();
			return true;

		case 'ls': {
			const { flags, args } = parseFlagsAndArgs(arg);
			const targetPath = args[0] || '';
			const result = listDirectory(targetPath, cwd, fs, {
				showAll: flags.has('a'),
				longListing: flags.has('l'),
			});

			if (result.error) {
				addEntry(trimmed, [`\x1b[91m${result.error}\x1b[0m`], terminalColors.error);
				return true;
			}
			addEntry(trimmed, result.lines || []);
			return true;
		}

		case 'tree': {
			const { args } = parseFlagsAndArgs(arg);
			const targetPath = args[0] || '';
			const result = generateTree(targetPath, cwd, fs);

			if (result.error) {
				addEntry(trimmed, [`\x1b[91m${result.error}\x1b[0m`], terminalColors.error);
				return true;
			}
			addEntry(trimmed, result.lines || []);
			return true;
		}

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
			addEntry(trimmed, [`\x1b[92m up ${formatUptime(sessionStart)}\x1b[0m`]);
			return true;

		case 'history':
			if (history.length === 0) {
				addEntry(trimmed, [t('terminal.info.emptyHistory')]);
			} else {
				addEntry(
					trimmed,
					history.map((h, i) => `\x1b[90m${String(i + 1).padStart(4)}\x1b[0m  ${h}`),
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
			addEntry(trimmed, buildNeofetch({ isDark, language, uptime: formatUptime(sessionStart) }));
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
			addEntry(trimmed, ['', ...formatReviews(data, t)]);
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
				setPreviousCwd(cwd);
				setCwd('/home/gabriel');
				return true;
			}
			if (arg === '-') {
				const target = previousCwd || PROJECT_ROOT;
				setPreviousCwd(cwd);
				setCwd(target);
				addEntry(trimmed, [target]);
				return true;
			}
			const newPath = normalizePath(cwd, arg);
			if (!fs[newPath]) {
				addEntry(trimmed, [`\x1b[91mcd: ${arg}: No such file or directory\x1b[0m`], terminalColors.error);
				return true;
			}
			setPreviousCwd(cwd);
			setCwd(newPath);
			return true;
		}

		case 'nano':
		case 'vim':
		case 'vi': {
			const targetArg = arg.trim();
			if (!targetArg) {
				addEntry(trimmed, [`\x1b[33mUsage: ${cmd} <filename>\x1b[0m`]);
				return true;
			}
			const filePath = normalizePath(cwd, targetArg);
			if (fs[filePath]) {
				addEntry(trimmed, [`\x1b[91m${cmd}: ${targetArg}: Is a directory\x1b[0m`], terminalColors.error);
				return true;
			}

			const parent = filePath.substring(0, filePath.lastIndexOf('/')) || '/';
			const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);

			const fileLines = getFileLines(fs, parent, fileName);
			const fileContent = fileLines ? fileLines.join('\n') : '';

			if (ctx.openEditor) {
				ctx.openEditor({
					fileName,
					filePath,
					initialContent: fileContent,
				});
			}
			return true;
		}

		case 'code': {
			const targetArg = arg.trim();
			if (!targetArg || targetArg === '.') {
				window.dispatchEvent(new CustomEvent('open-tab', { detail: { target: '.' } }));
				addEntry(trimmed, ['\x1b[92mOpening workspace in VSCode editor...\x1b[0m']);
				return true;
			}

			const filePath = normalizePath(cwd, targetArg);
			const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);

			window.dispatchEvent(new CustomEvent('open-tab', { detail: { target: fileName } }));
			addEntry(trimmed, [`\x1b[92mOpening ${fileName} in editor...\x1b[0m`]);
			return true;
		}

		case 'reset':
		case 'reset-data':
		case 'restore': {
			StorageService.clearData();
			setFs(PROJECT_FS);
			setCwd(PROJECT_ROOT);
			setPreviousCwd(PROJECT_ROOT);
			window.dispatchEvent(new Event('storage'));
			window.dispatchEvent(new CustomEvent('open-tab', { detail: { target: '.' } }));
			addEntry(trimmed, [
				'\x1b[92m✔ Portfolio data and files have been reset to factory defaults.\x1b[0m',
				'\x1b[90mAll virtual files and local editor data restored.\x1b[0m',
			]);
			return true;
		}

		case 'cat': {
			const { flags, args } = parseFlagsAndArgs(arg);
			if (args.length === 0) {
				addEntry(trimmed, ['\x1b[33mUsage: cat <filename>\x1b[0m']);
				return true;
			}

			const linesOutput: string[] = [];

			for (const fileArg of args) {
				const filePath = normalizePath(cwd, fileArg);
				if (fs[filePath]) {
					addEntry(trimmed, [`\x1b[91mcat: ${fileArg}: Is a directory\x1b[0m`], terminalColors.error);
					return true;
				}

				const parent = filePath.substring(0, filePath.lastIndexOf('/')) || '/';
				const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
				const lines = getFileLines(fs, parent, fileName);

				if (!lines) {
					addEntry(trimmed, [`\x1b[91mcat: ${fileArg}: No such file\x1b[0m`], terminalColors.error);
					return true;
				}

				const formatted = formatFileContent(fileName, lines, {
					plain: flags.has('p'),
					showLineNumbers: true,
				});
				linesOutput.push(...formatted);
			}

			addEntry(trimmed, linesOutput);
			return true;
		}

		case 'head':
		case 'tail': {
			const tokens = arg.split(/\s+/).filter(Boolean);
			let count = 10;
			let fileArg = '';

			for (let i = 0; i < tokens.length; i++) {
				if (tokens[i] === '-n' && tokens[i + 1]) {
					count = parseInt(tokens[i + 1], 10) || 10;
					i += 1;
				} else if (tokens[i].startsWith('-n') && tokens[i].length > 2) {
					count = parseInt(tokens[i].slice(2), 10) || 10;
				} else if (!fileArg) {
					fileArg = tokens[i];
				}
			}

			if (!fileArg) {
				addEntry(trimmed, [`\x1b[33mUsage: ${cmd} [-n lines] <filename>\x1b[0m`]);
				return true;
			}

			const filePath = normalizePath(cwd, fileArg);
			const parent = filePath.substring(0, filePath.lastIndexOf('/')) || '/';
			const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
			const lines = getFileLines(fs, parent, fileName);

			if (!lines) {
				addEntry(trimmed, [`\x1b[91m${cmd}: ${fileArg}: No such file\x1b[0m`], terminalColors.error);
				return true;
			}

			const sliced = cmd === 'head' ? lines.slice(0, count) : lines.slice(-count);
			addEntry(trimmed, sliced);
			return true;
		}

		case 'grep': {
			const { flags, args } = parseFlagsAndArgs(arg);
			if (args.length < 2) {
				addEntry(trimmed, ['\x1b[33mUsage: grep [-i] <pattern> <filename>\x1b[0m']);
				return true;
			}

			const patternStr = args[0];
			const fileArg = args[1];
			const filePath = normalizePath(cwd, fileArg);
			const parent = filePath.substring(0, filePath.lastIndexOf('/')) || '/';
			const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
			const lines = getFileLines(fs, parent, fileName);

			if (!lines) {
				addEntry(trimmed, [`\x1b[91mgrep: ${fileArg}: No such file\x1b[0m`], terminalColors.error);
				return true;
			}

			const isCaseInsensitive = flags.has('i');
			const regex = new RegExp(patternStr, isCaseInsensitive ? 'i' : '');
			const matchedLines: string[] = [];

			lines.forEach((line, idx) => {
				if (regex.test(line)) {
					const highlighted = line.replace(
						regex,
						(match) => `\x1b[1;31m${match}\x1b[0m`,
					);
					matchedLines.push(`\x1b[90m${idx + 1}:\x1b[0m ${highlighted}`);
				}
			});

			addEntry(trimmed, matchedLines.length > 0 ? matchedLines : []);
			return true;
		}

		case 'wc': {
			const { flags, args } = parseFlagsAndArgs(arg);
			if (args.length === 0) {
				addEntry(trimmed, ['\x1b[33mUsage: wc [-l] <filename>\x1b[0m']);
				return true;
			}

			const fileArg = args[0];
			const filePath = normalizePath(cwd, fileArg);
			const parent = filePath.substring(0, filePath.lastIndexOf('/')) || '/';
			const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
			const lines = getFileLines(fs, parent, fileName);

			if (!lines) {
				addEntry(trimmed, [`\x1b[91mwc: ${fileArg}: No such file\x1b[0m`], terminalColors.error);
				return true;
			}

			const linesCount = lines.length;
			const wordsCount = lines.join(' ').split(/\s+/).filter(Boolean).length;
			const bytesCount = lines.join('\n').length;

			if (flags.has('l')) {
				addEntry(trimmed, [`${String(linesCount).padStart(6)} ${fileArg}`]);
				return true;
			}

			addEntry(trimmed, [
				`${String(linesCount).padStart(6)} ${String(wordsCount).padStart(6)} ${String(bytesCount).padStart(6)} ${fileArg}`,
			]);
			return true;
		}

		case 'touch': {
			if (!arg) {
				addEntry(trimmed, ['\x1b[33mUsage: touch <filename>\x1b[0m']);
				return true;
			}

			const targetPath = normalizePath(cwd, arg);
			const parent = targetPath.substring(0, targetPath.lastIndexOf('/')) || '/';
			const fileName = targetPath.substring(targetPath.lastIndexOf('/') + 1);

			if (!fs[parent]) {
				addEntry(trimmed, [`\x1b[91mtouch: cannot touch '${arg}': No such file or directory\x1b[0m`], terminalColors.error);
				return true;
			}

			setFs((prev) => {
				const next = { ...prev };
				const currentEntries = [...(next[parent] || [])];
				if (!currentEntries.some((e) => e.name === fileName && e.type === 'file')) {
					currentEntries.push({ name: fileName, type: 'file', content: [] });
					next[parent] = currentEntries;
				}
				return next;
			});
			return true;
		}

		case 'mkdir': {
			if (!arg) {
				addEntry(trimmed, ['\x1b[33mUsage: mkdir <directory>\x1b[0m']);
				return true;
			}

			const targetPath = normalizePath(cwd, arg);
			const parent = targetPath.substring(0, targetPath.lastIndexOf('/')) || '/';
			const dirName = targetPath.substring(targetPath.lastIndexOf('/') + 1);

			if (!fs[parent]) {
				addEntry(trimmed, [`\x1b[91mmkdir: cannot create directory '${arg}': No such file or directory\x1b[0m`], terminalColors.error);
				return true;
			}

			setFs((prev) => {
				const next = { ...prev };
				const parentEntries = [...(next[parent] || [])];
				if (!parentEntries.some((e) => e.name === dirName && e.type === 'dir')) {
					parentEntries.push({ name: dirName, type: 'dir' });
					next[parent] = parentEntries;
				}
				next[targetPath] ??= [];
				return next;
			});
			return true;
		}

		case 'rm': {
			const { flags, args } = parseFlagsAndArgs(arg);
			if (args.length === 0) {
				addEntry(trimmed, ['\x1b[33mUsage: rm [-r] <path>\x1b[0m']);
				return true;
			}

			const fileArg = args[0];
			const targetPath = normalizePath(cwd, fileArg);
			const parent = targetPath.substring(0, targetPath.lastIndexOf('/')) || '/';
			const targetName = targetPath.substring(targetPath.lastIndexOf('/') + 1);

			if (fs[targetPath] && !flags.has('r')) {
				addEntry(trimmed, [`\x1b[91mrm: cannot remove '${fileArg}': Is a directory\x1b[0m`], terminalColors.error);
				return true;
			}

			setFs((prev) => {
				const next = { ...prev };
				if (next[parent]) {
					next[parent] = next[parent].filter((e) => e.name !== targetName);
				}
				if (flags.has('r')) {
					delete next[targetPath];
				}
				return next;
			});
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
}
