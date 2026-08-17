import { CommandExecutionContext } from './commands';
import { commandRegistry } from './commandRegistry';

export type { CommandExecutionContext };

export async function executeLocalCommand(
	rawCommand: string,
	ctx: CommandExecutionContext,
): Promise<boolean> {
	return commandRegistry.execute(rawCommand, ctx);
}
