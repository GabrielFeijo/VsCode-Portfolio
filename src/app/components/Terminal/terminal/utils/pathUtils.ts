import { VirtualDirectory, VirtualFileEntry } from '../types';

export const PATH_COMMANDS = [
	'cd',
	'ls',
	'code',
	'nano',
	'vim',
	'vi',
	'cat',
	'head',
	'tail',
	'grep',
	'wc',
	'touch',
	'mkdir',
	'rm',
	'tree',
	'echo',
];

export function normalizePath(base: string, target: string): string {
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

export function formatLsEntry(entry: VirtualFileEntry, isLong = false): string {
	const isDir = entry.type === 'dir';
	const suffix = isDir ? '/' : '';
	const color = isDir ? '\x1b[94m' : '\x1b[92m';
	const nameStr = `${color}${entry.name}${suffix}\x1b[0m`;

	if (!isLong) {
		return nameStr;
	}

	const perms = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
	const size = isDir ? '4096' : String(entry.content?.join('\n').length ?? 0);
	const paddedSize = size.padStart(6, ' ');
	return `${perms}  gabriel  gabriel  ${paddedSize}  ${nameStr}`;
}

export function listDirectory(
	argPath: string,
	cwd: string,
	fs: VirtualDirectory,
	options: { showAll?: boolean; longListing?: boolean } = {},
): { lines?: string[]; error?: string } {
	const target = argPath ? normalizePath(cwd, argPath) : cwd;

	if (fs[target]) {
		const rawEntries = fs[target] || [];
		const entries = options.showAll
			? [
					{ name: '.', type: 'dir' as const },
					{ name: '..', type: 'dir' as const },
					...rawEntries,
				]
			: rawEntries;

		return {
			lines: entries.map((entry) => formatLsEntry(entry, options.longListing)),
		};
	}

	const parent = target.substring(0, target.lastIndexOf('/')) || '/';
	const fileName = target.substring(target.lastIndexOf('/') + 1);
	const file = fs[parent]?.find((e) => e.name === fileName);

	if (file) {
		return {
			lines: [formatLsEntry(file, options.longListing)],
		};
	}

	return {
		error: `ls: cannot access '${argPath || target}': No such file or directory`,
	};
}

export function generateTree(
	argPath: string,
	cwd: string,
	fs: VirtualDirectory,
	maxDepth = 3,
): { lines?: string[]; error?: string } {
	const target = argPath ? normalizePath(cwd, argPath) : cwd;
	if (!fs[target]) {
		return { error: `tree: '${argPath || target}': No such directory` };
	}

	const result: string[] = [`\x1b[94m${argPath || target}\x1b[0m`];

	function walk(currentPath: string, prefix: string, depth: number) {
		if (depth > maxDepth) return;
		const entries = fs[currentPath] || [];

		entries.forEach((entry, index) => {
			const isLast = index === entries.length - 1;
			const pointer = isLast ? '└── ' : '├── ';
			const nextPrefix = prefix + (isLast ? '    ' : '│   ');

			if (entry.type === 'dir') {
				result.push(`${prefix}${pointer}\x1b[94m${entry.name}/\x1b[0m`);
				walk(`${currentPath}/${entry.name}`, nextPrefix, depth + 1);
			} else {
				result.push(`${prefix}${pointer}\x1b[92m${entry.name}\x1b[0m`);
			}
		});
	}

	walk(target, '', 1);
	return { lines: result };
}

export function completePathArgument(arg: string, cwd: string, fs: VirtualDirectory): string[] {
	const lastSlash = arg.lastIndexOf('/');
	const base = lastSlash >= 0 ? arg.slice(0, lastSlash + 1) : '';
	const prefix = lastSlash >= 0 ? arg.slice(lastSlash + 1) : arg;

	const dirPath = base.startsWith('/')
		? base.replace(/\/+$/, '') || '/'
		: base
			? normalizePath(cwd, base)
			: cwd;

	const entries = fs[dirPath];
	if (!entries) return [];

	return entries
		.filter((entry) => entry.name.startsWith(prefix))
		.map((entry) => base + entry.name + (entry.type === 'dir' ? '/' : ''));
}
