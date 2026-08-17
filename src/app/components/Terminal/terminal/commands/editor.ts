import { getFileLinesAsync } from '../utils/fileLookup';
import { normalizePath } from '../utils/pathUtils';
import { ICommandDefinition } from './command.types';

export const editorCommands: ICommandDefinition[] = [
	{
		name: 'nano',
		aliases: ['vim', 'vi'],
		description: 'Open file in terminal text editor',
		execute: async (arg, ctx, rawCommand) => {
			const { cwd, fs, language, addEntry, terminalColors, openEditor } = ctx;
			const targetArg = arg.trim();
			const cmd = rawCommand.trim().split(/\s+/)[0].toLowerCase();

			if (!targetArg) {
				addEntry(rawCommand, [`\x1b[33mUsage: ${cmd} <filename>\x1b[0m`]);
				return true;
			}

			const filePath = normalizePath(cwd, targetArg);
			if (fs[filePath]) {
				addEntry(rawCommand, [`\x1b[91m${cmd}: ${targetArg}: Is a directory\x1b[0m`], terminalColors.error);
				return true;
			}

			const parent = filePath.substring(0, filePath.lastIndexOf('/')) || '/';
			const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);

			const fileLines = await getFileLinesAsync(fs, parent, fileName, language);
			const fileContent = fileLines ? fileLines.join('\n') : '';

			if (openEditor) {
				openEditor({
					fileName,
					filePath,
					initialContent: fileContent,
				});
			}
			return true;
		},
	},
	{
		name: 'code',
		description: 'Open file or workspace in editor',
		execute: (arg, ctx, rawCommand) => {
			const targetArg = arg.trim();
			if (!targetArg || targetArg === '.') {
				window.dispatchEvent(new CustomEvent('open-tab', { detail: { target: '.' } }));
				ctx.addEntry(rawCommand, ['\x1b[92mOpening workspace in VSCode editor...\x1b[0m']);
				return true;
			}

			const filePath = normalizePath(ctx.cwd, targetArg);
			const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);

			window.dispatchEvent(new CustomEvent('open-tab', { detail: { target: fileName } }));
			ctx.addEntry(rawCommand, [`\x1b[92mOpening ${fileName} in editor...\x1b[0m`]);
			return true;
		},
	},
];
