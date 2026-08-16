import { PROJECT_ROOT } from '../terminalConfig';
import { normalizePath } from '../utils/pathUtils';
import { ICommandDefinition } from './command.types';

export const cdCommand: ICommandDefinition = {
	name: 'cd',
	description: 'Change the current working directory',
	execute: (arg, ctx, rawCommand) => {
		const { cwd, setCwd, previousCwd, setPreviousCwd, fs, addEntry, terminalColors } = ctx;

		if (!arg) {
			setPreviousCwd(cwd);
			setCwd('/home/gabriel');
			return true;
		}

		if (arg === '-') {
			const target = previousCwd || PROJECT_ROOT;
			setPreviousCwd(cwd);
			setCwd(target);
			addEntry(rawCommand, [target]);
			return true;
		}

		const newPath = normalizePath(cwd, arg);
		if (!fs[newPath]) {
			addEntry(rawCommand, [`\x1b[91mcd: ${arg}: No such file or directory\x1b[0m`], terminalColors.error);
			return true;
		}

		setPreviousCwd(cwd);
		setCwd(newPath);
		return true;
	},
};
