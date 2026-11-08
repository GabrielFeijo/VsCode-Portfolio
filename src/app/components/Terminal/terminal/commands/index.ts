import { catCommand } from './cat';
import { cdCommand } from './cd';
import { clearCommand } from './clear';
import type { ICommandDefinition } from './command.types';
import { editorCommands } from './editor';
import { filesystemCommands } from './filesystem';
import { funCommands } from './fun';
import { helpCommand } from './help';
import { lsCommand } from './ls';
import { manCommand } from './man';
import { navigationCommands } from './navigation';
import { networkCommands } from './network';
import { pwdCommand } from './pwd';
import { systemCommands } from './system';
import { textUtilsCommands } from './textUtils';
import { treeCommand } from './tree';

export * from './cat';
export * from './cd';
export * from './clear';
export * from './command.types';
export * from './editor';
export * from './filesystem';
export * from './fun';
export * from './help';
export * from './ls';
export * from './man';
export * from './navigation';
export * from './network';
export * from './pwd';
export * from './system';
export * from './textUtils';
export * from './tree';

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
