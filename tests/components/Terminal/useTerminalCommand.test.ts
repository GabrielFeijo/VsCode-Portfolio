import { renderHook, act } from '@testing-library/react';
import { useTerminalCommand, CommandExecutionDependencies } from '@/app/components/Terminal/terminal/hooks/useTerminalCommand';
import { getTerminalColors } from '@/app/components/Terminal/terminal/terminalConfig';
import { executeLocalCommand } from '@/app/components/Terminal/terminal/commandExecutor';

jest.mock('@/app/components/Terminal/terminal/commandExecutor', () => ({
	executeLocalCommand: jest.fn(),
}));

describe('useTerminalCommand', () => {
	const createDeps = (overrides: Partial<CommandExecutionDependencies> = {}): CommandExecutionDependencies => ({
		language: 'pt',
		cwd: '/home/gabriel',
		setCwd: jest.fn(),
		previousCwd: '/home/gabriel',
		setPreviousCwd: jest.fn(),
		addEntry: jest.fn(),
		clearEntries: jest.fn(),
		historyRef: { current: [] },
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
		apiCommandList: ['api-cmd'],
		commandMap: new Map([['cached-cmd', ['cached line 1', 'cached line 2']]]),
		fetchApiCommandResponse: jest.fn().mockResolvedValue(['api response line']),
		...overrides,
	});

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('initializes with empty command and null activeEditor', () => {
		const deps = createDeps();
		const { result } = renderHook(() => useTerminalCommand(deps));

		expect(result.current.command).toBe('');
		expect(result.current.commandRef.current).toBe('');
		expect(result.current.activeEditor).toBeNull();
	});

	it('updates command and commandRef via setCommand', () => {
		const deps = createDeps();
		const { result } = renderHook(() => useTerminalCommand(deps));

		act(() => {
			result.current.setCommand('hello');
		});

		expect(result.current.command).toBe('hello');
		expect(result.current.commandRef.current).toBe('hello');
	});

	it('ignores execution if command length <= 1', async () => {
		const deps = createDeps();
		const { result } = renderHook(() => useTerminalCommand(deps));

		await act(async () => {
			await result.current.executeCommand(' ');
			await result.current.executeCommand('a');
		});

		expect(executeLocalCommand).not.toHaveBeenCalled();
		expect(deps.addEntry).not.toHaveBeenCalled();
	});

	it('executes local command successfully when handled by command executor', async () => {
		(executeLocalCommand as jest.Mock).mockResolvedValue(true);
		const deps = createDeps();
		const { result } = renderHook(() => useTerminalCommand(deps));

		await act(async () => {
			await result.current.executeCommand('help');
		});

		expect(executeLocalCommand).toHaveBeenCalledWith('help', expect.objectContaining({
			language: 'pt',
			cwd: '/home/gabriel',
		}));
		expect(deps.fetchApiCommandResponse).not.toHaveBeenCalled();
	});

	it('opens editor when openEditor callback is invoked from local command execution', async () => {
		(executeLocalCommand as jest.Mock).mockImplementation(async (_cmd, ctx) => {
			ctx.openEditor({ fileName: 'test.md', filePath: '/test.md', initialContent: 'hi' });
			return true;
		});

		const deps = createDeps();
		const { result } = renderHook(() => useTerminalCommand(deps));

		await act(async () => {
			await result.current.executeCommand('nano test.md');
		});

		expect(result.current.activeEditor).toEqual({
			fileName: 'test.md',
			filePath: '/test.md',
			initialContent: 'hi',
		});

		act(() => {
			result.current.closeEditor();
		});

		expect(result.current.activeEditor).toBeNull();
	});

	it('uses commandMap cached response if available when not handled locally', async () => {
		(executeLocalCommand as jest.Mock).mockResolvedValue(false);
		const deps = createDeps();
		const { result } = renderHook(() => useTerminalCommand(deps));

		await act(async () => {
			await result.current.executeCommand('cached-cmd');
		});

		expect(deps.addEntry).toHaveBeenCalledWith('cached-cmd', ['cached line 1', 'cached line 2']);
		expect(deps.fetchApiCommandResponse).not.toHaveBeenCalled();
	});

	it('falls back to API and adds entry when API returns response lines', async () => {
		(executeLocalCommand as jest.Mock).mockResolvedValue(false);
		const deps = createDeps();
		const { result } = renderHook(() => useTerminalCommand(deps));

		await act(async () => {
			await result.current.executeCommand('custom-api-cmd');
		});

		expect(deps.fetchApiCommandResponse).toHaveBeenCalledWith('custom-api-cmd');
		expect(deps.addEntry).toHaveBeenCalledWith('custom-api-cmd', ['api response line']);
	});

	it('maps ajuda command to help when calling API', async () => {
		(executeLocalCommand as jest.Mock).mockResolvedValue(false);
		const deps = createDeps();
		const { result } = renderHook(() => useTerminalCommand(deps));

		await act(async () => {
			await result.current.executeCommand('ajuda');
		});

		expect(deps.fetchApiCommandResponse).toHaveBeenCalledWith('help');
	});

	it('adds error message when API command returns an Error', async () => {
		(executeLocalCommand as jest.Mock).mockResolvedValue(false);
		const deps = createDeps({
			fetchApiCommandResponse: jest.fn().mockResolvedValue(new Error('not found')),
		});
		const { result } = renderHook(() => useTerminalCommand(deps));

		await act(async () => {
			await result.current.executeCommand('unknown-command');
		});

		expect(deps.addEntry).toHaveBeenCalledWith(
			'unknown-command',
			expect.arrayContaining([expect.stringContaining('zsh: command not found: unknown-command')]),
			deps.terminalColors.error
		);
	});

	it('submits command from commandRef and clears command state', async () => {
		(executeLocalCommand as jest.Mock).mockResolvedValue(true);
		const deps = createDeps();
		const { result } = renderHook(() => useTerminalCommand(deps));

		act(() => {
			result.current.setCommand('pwd');
		});

		await act(async () => {
			await result.current.submitCommand();
		});

		expect(result.current.command).toBe('');
		expect(result.current.commandRef.current).toBe('');
		expect(executeLocalCommand).toHaveBeenCalledWith('pwd', expect.any(Object));
	});
});
