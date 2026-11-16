import { commandRegistry } from './command-registry';
import type { CommandExecutionContext } from './commands';

export type { CommandExecutionContext };

export async function executeLocalCommand(
	rawCommand: string,
	ctx: CommandExecutionContext,
): Promise<boolean> {
	return commandRegistry.execute(rawCommand, ctx);
}
