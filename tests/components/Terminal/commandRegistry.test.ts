import { CommandRegistry, commandRegistry } from '@/app/components/Terminal/terminal/commandRegistry';
import { CommandExecutionContext, ICommandDefinition } from '@/app/components/Terminal/terminal/commands/command.types';
import { getTerminalColors } from '@/app/components/Terminal/terminal/terminalConfig';

jest.mock('@/services/api/review/ReviewService', () => ({
	ReviewService: {
		findAll: jest.fn().mockResolvedValue([]),
	},
}));

describe('CommandRegistry', () => {
	const createMockContext = (): CommandExecutionContext => ({
		language: 'pt',
		cwd: '/home/gabriel/portfolio',
		setCwd: jest.fn(),
		previousCwd: '/home/gabriel/portfolio',
		setPreviousCwd: jest.fn(),
		addEntry: jest.fn(),
		clearEntries: jest.fn(),
		history: [],
		toggleTheme: jest.fn(),
		changeLanguage: jest.fn(),
		setRanking: jest.fn(),
		navigate: jest.fn(),
		terminalColors: getTerminalColors('dark'),
		t: (key: string) => key,
		sessionStart: Date.now(),
		isDark: true,
		fs: {},
		setFs: jest.fn(),
		apiCommandList: [],
		openEditor: jest.fn(),
	});

	it('registers and retrieves commands by name and alias', () => {
		const registry = new CommandRegistry();
		const testCommand: ICommandDefinition = {
			name: 'custom',
			aliases: ['c', 'alias-custom'],
			description: 'Custom test command',
			execute: jest.fn(),
		};

		registry.register(testCommand);

		expect(registry.has('custom')).toBe(true);
		expect(registry.has('c')).toBe(true);
		expect(registry.has('alias-custom')).toBe(true);
		expect(registry.has('unknown')).toBe(false);
		expect(registry.get('CUSTOM')).toBe(testCommand);
		expect(registry.get('C')).toBe(testCommand);
		expect(registry.getAll()).toEqual([testCommand]);
		expect(registry.getAllNames()).toContain('custom');
		expect(registry.getAllNames()).toContain('c');
	});

	it('executes a registered command and handles arguments', async () => {
		const registry = new CommandRegistry();
		const executeFn = jest.fn();
		const testCommand: ICommandDefinition = {
			name: 'test',
			execute: executeFn,
		};

		registry.register(testCommand);
		const ctx = createMockContext();

		const handled = await registry.execute('test arg1 arg2', ctx);
		expect(handled).toBe(true);
		expect(executeFn).toHaveBeenCalledWith('arg1 arg2', ctx, 'test arg1 arg2');
	});

	it('returns false for unknown commands or empty input', async () => {
		const registry = new CommandRegistry();
		const ctx = createMockContext();

		expect(await registry.execute('', ctx)).toBe(false);
		expect(await registry.execute('   ', ctx)).toBe(false);
		expect(await registry.execute('nonexistent-cmd', ctx)).toBe(false);
	});

	it('default commandRegistry contains all built-in commands', () => {
		expect(commandRegistry.has('help')).toBe(true);
		expect(commandRegistry.has('ls')).toBe(true);
		expect(commandRegistry.has('cd')).toBe(true);
		expect(commandRegistry.has('pwd')).toBe(true);
		expect(commandRegistry.has('cat')).toBe(true);
		expect(commandRegistry.has('clear')).toBe(true);
		expect(commandRegistry.has('matrix')).toBe(true);
	});
});
