import { formatFileContent } from '../utils/fileFormatter';
import { getFileLinesAsync } from '../utils/fileLookup';
import { normalizePath } from '../utils/pathUtils';
import { parseFlagsAndArgs } from '../utils/commandArgs';
import { ICommandDefinition } from './command.types';

export const catCommand: ICommandDefinition = {
	name: 'cat',
	description: 'Concatenate and display file content',
	execute: async (arg, ctx, rawCommand) => {
		const { cwd, fs, language, addEntry, terminalColors } = ctx;
		const { flags, args } = parseFlagsAndArgs(arg);

		if (args.length === 0) {
			addEntry(rawCommand, ['\x1b[33mUsage: cat <filename>\x1b[0m']);
			return true;
		}

		const linesOutput: string[] = [];

		for (const fileArg of args) {
			const filePath = normalizePath(cwd, fileArg);
			if (fs[filePath]) {
				addEntry(rawCommand, [`\x1b[91mcat: ${fileArg}: Is a directory\x1b[0m`], terminalColors.error);
				return true;
			}

			const parent = filePath.substring(0, filePath.lastIndexOf('/')) || '/';
			const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
			const lines = await getFileLinesAsync(fs, parent, fileName, language);

			if (!lines) {
				addEntry(rawCommand, [`\x1b[91mcat: ${fileArg}: No such file\x1b[0m`], terminalColors.error);
				return true;
			}

			const formatted = formatFileContent(fileName, lines, {
				plain: flags.has('p'),
				showLineNumbers: true,
			});
			linesOutput.push(...formatted);
		}

		addEntry(rawCommand, linesOutput);
		return true;
	},
};
