import { parseFlagsAndArgs } from '../utils/commandArgs';
import { normalizePath } from '../utils/pathUtils';
import { ICommandDefinition } from './command.types';

export const filesystemCommands: ICommandDefinition[] = [
	{
		name: 'touch',
		description: 'Create an empty file',
		execute: (arg, ctx, rawCommand) => {
			const { cwd, fs, setFs, addEntry, terminalColors } = ctx;
			if (!arg) {
				addEntry(rawCommand, ['\x1b[33mUsage: touch <filename>\x1b[0m']);
				return true;
			}

			const targetPath = normalizePath(cwd, arg);
			const parent = targetPath.substring(0, targetPath.lastIndexOf('/')) || '/';
			const fileName = targetPath.substring(targetPath.lastIndexOf('/') + 1);

			if (!fs[parent]) {
				addEntry(rawCommand, [`\x1b[91mtouch: cannot touch '${arg}': No such file or directory\x1b[0m`], terminalColors.error);
				return true;
			}

			setFs((prev) => {
				const next = { ...prev };
				const currentEntries = [...next[parent]];
				if (!currentEntries.some((e) => e.name === fileName && e.type === 'file')) {
					currentEntries.push({ name: fileName, type: 'file', content: [] });
					next[parent] = currentEntries;
				}
				return next;
			});
			return true;
		},
	},
	{
		name: 'mkdir',
		description: 'Create a directory',
		execute: (arg, ctx, rawCommand) => {
			const { cwd, fs, setFs, addEntry, terminalColors } = ctx;
			if (!arg) {
				addEntry(rawCommand, ['\x1b[33mUsage: mkdir <directory>\x1b[0m']);
				return true;
			}

			const targetPath = normalizePath(cwd, arg);
			const parent = targetPath.substring(0, targetPath.lastIndexOf('/')) || '/';
			const dirName = targetPath.substring(targetPath.lastIndexOf('/') + 1);

			if (!fs[parent]) {
				addEntry(rawCommand, [`\x1b[91mmkdir: cannot create directory '${arg}': No such file or directory\x1b[0m`], terminalColors.error);
				return true;
			}

			setFs((prev) => {
				const next = { ...prev };
				const parentEntries = [...next[parent]];
				if (!parentEntries.some((e) => e.name === dirName && e.type === 'dir')) {
					parentEntries.push({ name: dirName, type: 'dir' });
					next[parent] = parentEntries;
				}
				next[targetPath] ??= [];
				return next;
			});
			return true;
		},
	},
	{
		name: 'rm',
		description: 'Remove files or directories',
		execute: (arg, ctx, rawCommand) => {
			const { cwd, fs, setFs, addEntry, terminalColors } = ctx;
			const { flags, args } = parseFlagsAndArgs(arg);
			if (args.length === 0) {
				addEntry(rawCommand, ['\x1b[33mUsage: rm [-r] <path>\x1b[0m']);
				return true;
			}

			const fileArg = args[0];
			const targetPath = normalizePath(cwd, fileArg);
			const parent = targetPath.substring(0, targetPath.lastIndexOf('/')) || '/';
			const targetName = targetPath.substring(targetPath.lastIndexOf('/') + 1);

			if (fs[targetPath] && !flags.has('r')) {
				addEntry(rawCommand, [`\x1b[91mrm: cannot remove '${fileArg}': Is a directory\x1b[0m`], terminalColors.error);
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
		},
	},
];
