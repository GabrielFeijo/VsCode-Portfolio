import { ICommandDefinition } from './command.types';
import { helpCommand } from './help';
import { clearCommand } from './clear';
import { lsCommand } from './ls';
import { cdCommand } from './cd';
import { pwdCommand } from './pwd';
import { treeCommand } from './tree';
import { catCommand } from './cat';
import { editorCommands } from './editor';
import { filesystemCommands } from './filesystem';
import { textUtilsCommands } from './textUtils';
import { systemCommands } from './system';
import { navigationCommands } from './navigation';
import { networkCommands } from './network';
import { manCommand } from './man';
import { funCommands } from './fun';

export * from './command.types';
export * from './help';
export * from './clear';
export * from './ls';
export * from './cd';
export * from './pwd';
export * from './tree';
export * from './cat';
export * from './editor';
export * from './filesystem';
export * from './textUtils';
export * from './system';
export * from './navigation';
export * from './network';
export * from './man';
export * from './fun';

export const BUILTIN_COMMANDS: ICommandDefinition[] = [
	helpCommand,
	clearCommand,
	lsCommand,
	cdCommand,
	pwdCommand,
	treeCommand,
	catCommand,
	...editorCommands,
	...filesystemCommands,
	...textUtilsCommands,
	...systemCommands,
	...navigationCommands,
	...networkCommands,
	manCommand,
	...funCommands,
];
