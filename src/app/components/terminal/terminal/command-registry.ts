import { BUILTIN_COMMANDS, type CommandDefinition, type CommandExecutionContext } from './commands';

export class CommandRegistry {
	private readonly commandMap = new Map<string, CommandDefinition>();
	private readonly commandList: CommandDefinition[] = [];

	constructor(initialCommands: CommandDefinition[] = []) {
		this.registerAll(initialCommands);
	}

	public register(cmd: CommandDefinition): void {
		this.commandList.push(cmd);
		this.commandMap.set(cmd.name.toLowerCase(), cmd);

		if (cmd.aliases) {
			for (const alias of cmd.aliases) {
				this.commandMap.set(alias.toLowerCase(), cmd);
			}
		}
	}

	public registerAll(commands: CommandDefinition[]): void {
		for (const cmd of commands) {
			this.register(cmd);
		}
	}

	public get(name: string): CommandDefinition | undefined {
		return this.commandMap.get(name.toLowerCase());
	}

	public has(name: string): boolean {
		return this.commandMap.has(name.toLowerCase());
	}

	public getAll(): CommandDefinition[] {
		return [...this.commandList];
	}

	public getAllNames(): string[] {
		return Array.from(this.commandMap.keys());
	}

	public async execute(rawCommand: string, ctx: CommandExecutionContext): Promise<boolean> {
		const trimmed = rawCommand.trim();
		if (!trimmed) return false;

		const spaceIdx = trimmed.indexOf(' ');
		const cmdName =
			spaceIdx > 0 ? trimmed.substring(0, spaceIdx).toLowerCase() : trimmed.toLowerCase();
		const arg = spaceIdx > 0 ? trimmed.substring(spaceIdx + 1) : '';

		const command = this.get(cmdName);
		if (!command) {
			return false;
		}

		const result = await command.execute(arg, ctx, trimmed);
		return result !== false;
	}
}

export const commandRegistry = new CommandRegistry(BUILTIN_COMMANDS);
