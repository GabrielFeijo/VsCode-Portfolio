import { commandRegistry } from './commandRegistry';
import type { CommandExecutionContext } from './commands';

export type { CommandExecutionContext };

export async function executeLocalCommand(
	rawCommand: string,
	ctx: CommandExecutionContext,
): Promise<boolean> {
	return commandRegistry.execute(rawCommand, ctx);
}
