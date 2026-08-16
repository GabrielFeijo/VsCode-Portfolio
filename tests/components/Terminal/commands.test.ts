import {
	catCommand,
	cdCommand,
	clearCommand,
	editorCommands,
	filesystemCommands,
	funCommands,
	helpCommand,
	lsCommand,
	manCommand,
	navigationCommands,
	networkCommands,
	pwdCommand,
	systemCommands,
	textUtilsCommands,
	treeCommand,
	CommandExecutionContext,
} from '@/app/components/Terminal/terminal/commands';
import { getTerminalColors } from '@/app/components/Terminal/terminal/terminalConfig';
import { ReviewService } from '@/services/api/review/ReviewService';
import { StorageService } from '@/services/storageService';

jest.mock('@/services/api/review/ReviewService', () => ({
	ReviewService: {
		findAll: jest.fn(),
	},
}));

jest.mock('@/services/storageService', () => ({
	StorageService: {
		getData: jest.fn(),
		clearData: jest.fn(),
	},
}));

describe('Terminal Commands', () => {
	let ctx: CommandExecutionContext;

	beforeEach(() => {
		jest.clearAllMocks();
		(StorageService.getData as jest.Mock).mockReturnValue([]);
		(ReviewService.findAll as jest.Mock).mockResolvedValue([]);

		ctx = {
			language: 'pt',
			cwd: '/home/gabriel/portfolio',
			setCwd: jest.fn(),
			previousCwd: '/home/gabriel',
			setPreviousCwd: jest.fn(),
			addEntry: jest.fn(),
			clearEntries: jest.fn(),
			history: ['ls', 'cd src'],
			toggleTheme: jest.fn(),
			changeLanguage: jest.fn(),
			setRanking: jest.fn(),
			navigate: jest.fn(),
			terminalColors: getTerminalColors('dark'),
			t: (key: string, opts?: Record<string, unknown>) => {
				if (opts?.route) return `navigating to ${opts.route}`;
				return key;
			},
			sessionStart: Date.now() - 60000,
			isDark: true,
			fs: {
				'/home/gabriel': [
					{ name: 'portfolio', type: 'dir' },
				],
				'/home/gabriel/portfolio': [
					{ name: 'README.md', type: 'file', content: ['# Title', 'Hello World'] },
					{ name: 'src', type: 'dir' },
				],
				'/home/gabriel/portfolio/src': [],
			},
			setFs: jest.fn(),
			apiCommandList: ['api-test'],
			openEditor: jest.fn(),
		};
	});

	it('helpCommand displays help information', () => {
		helpCommand.execute('', ctx, 'help');
		expect(ctx.addEntry).toHaveBeenCalledWith('help', expect.any(Array));
	});

	it('clearCommand clears terminal entries', () => {
		clearCommand.execute('', ctx, 'clear');
		expect(ctx.clearEntries).toHaveBeenCalled();
	});

	it('pwdCommand prints cwd', () => {
		pwdCommand.execute('', ctx, 'pwd');
		expect(ctx.addEntry).toHaveBeenCalledWith('pwd', ['/home/gabriel/portfolio']);
	});

	it('lsCommand lists directory contents and handles invalid directory error', () => {
		lsCommand.execute('', ctx, 'ls');
		expect(ctx.addEntry).toHaveBeenCalledWith('ls', expect.any(Array));

		lsCommand.execute('invalid-folder', ctx, 'ls invalid-folder');
		expect(ctx.addEntry).toHaveBeenCalledWith(
			'ls invalid-folder',
			[expect.stringContaining('No such file or directory')],
			ctx.terminalColors.error,
		);
	});

	it('treeCommand generates directory tree', () => {
		treeCommand.execute('', ctx, 'tree');
		expect(ctx.addEntry).toHaveBeenCalledWith('tree', expect.any(Array));

		treeCommand.execute('invalid-path', ctx, 'tree invalid-path');
		expect(ctx.addEntry).toHaveBeenCalledWith(
			'tree invalid-path',
			[expect.stringContaining('No such directory')],
			ctx.terminalColors.error,
		);
	});

	it('cdCommand changes directories, handles home path, previous cwd (-), and non-existent dirs', () => {
		cdCommand.execute('src', ctx, 'cd src');
		expect(ctx.setCwd).toHaveBeenCalledWith('/home/gabriel/portfolio/src');
		expect(ctx.setPreviousCwd).toHaveBeenCalledWith('/home/gabriel/portfolio');

		cdCommand.execute('', ctx, 'cd');
		expect(ctx.setCwd).toHaveBeenCalledWith('/home/gabriel');

		cdCommand.execute('-', ctx, 'cd -');
		expect(ctx.setCwd).toHaveBeenCalledWith('/home/gabriel');
		expect(ctx.addEntry).toHaveBeenCalledWith('cd -', ['/home/gabriel']);

		cdCommand.execute('nonexistent', ctx, 'cd nonexistent');
		expect(ctx.addEntry).toHaveBeenCalledWith(
			'cd nonexistent',
			[expect.stringContaining('No such file or directory')],
			ctx.terminalColors.error,
		);
	});

	it('catCommand prints file content, warns on missing arg or invalid file', async () => {
		await catCommand.execute('', ctx, 'cat');
		expect(ctx.addEntry).toHaveBeenCalledWith('cat', [expect.stringContaining('Usage: cat')]);

		await catCommand.execute('README.md', ctx, 'cat README.md');
		expect(ctx.addEntry).toHaveBeenCalledWith('cat README.md', expect.any(Array));

		await catCommand.execute('src', ctx, 'cat src');
		expect(ctx.addEntry).toHaveBeenCalledWith('cat src', [expect.stringContaining('Is a directory')], ctx.terminalColors.error);

		await catCommand.execute('missing.txt', ctx, 'cat missing.txt');
		expect(ctx.addEntry).toHaveBeenCalledWith('cat missing.txt', [expect.stringContaining('No such file')], ctx.terminalColors.error);
	});

	it('editorCommands handles nano, vim, and code', async () => {
		const nano = editorCommands.find((c) => c.name === 'nano')!;
		const code = editorCommands.find((c) => c.name === 'code')!;

		await nano.execute('', ctx, 'nano');
		expect(ctx.addEntry).toHaveBeenCalledWith('nano', [expect.stringContaining('Usage: nano')]);

		await nano.execute('src', ctx, 'nano src');
		expect(ctx.addEntry).toHaveBeenCalledWith('nano src', [expect.stringContaining('Is a directory')], ctx.terminalColors.error);

		await nano.execute('README.md', ctx, 'nano README.md');
		expect(ctx.openEditor).toHaveBeenCalledWith(expect.objectContaining({ fileName: 'README.md' }));

		code.execute('.', ctx, 'code .');
		expect(ctx.addEntry).toHaveBeenCalledWith('code .', [expect.stringContaining('Opening workspace')]);

		code.execute('README.md', ctx, 'code README.md');
		expect(ctx.addEntry).toHaveBeenCalledWith('code README.md', [expect.stringContaining('Opening README.md')]);
	});

	it('filesystemCommands handles touch, mkdir, rm', () => {
		const touch = filesystemCommands.find((c) => c.name === 'touch')!;
		const mkdir = filesystemCommands.find((c) => c.name === 'mkdir')!;
		const rm = filesystemCommands.find((c) => c.name === 'rm')!;

		touch.execute('', ctx, 'touch');
		expect(ctx.addEntry).toHaveBeenCalledWith('touch', [expect.stringContaining('Usage: touch')]);

		touch.execute('newfile.txt', ctx, 'touch newfile.txt');
		expect(ctx.setFs).toHaveBeenCalled();

		mkdir.execute('', ctx, 'mkdir');
		expect(ctx.addEntry).toHaveBeenCalledWith('mkdir', [expect.stringContaining('Usage: mkdir')]);

		mkdir.execute('newdir', ctx, 'mkdir newdir');
		expect(ctx.setFs).toHaveBeenCalled();

		rm.execute('', ctx, 'rm');
		expect(ctx.addEntry).toHaveBeenCalledWith('rm', [expect.stringContaining('Usage: rm')]);

		rm.execute('README.md', ctx, 'rm README.md');
		expect(ctx.setFs).toHaveBeenCalled();
	});

	it('textUtilsCommands handles head, grep, wc', async () => {
		const head = textUtilsCommands.find((c) => c.name === 'head')!;
		const grep = textUtilsCommands.find((c) => c.name === 'grep')!;
		const wc = textUtilsCommands.find((c) => c.name === 'wc')!;

		await head.execute('', ctx, 'head');
		expect(ctx.addEntry).toHaveBeenCalledWith('head', [expect.stringContaining('Usage: head')]);

		await head.execute('README.md', ctx, 'head README.md');
		expect(ctx.addEntry).toHaveBeenCalledWith('head README.md', ['# Title', 'Hello World']);

		await grep.execute('', ctx, 'grep');
		expect(ctx.addEntry).toHaveBeenCalledWith('grep', [expect.stringContaining('Usage: grep')]);

		await grep.execute('Hello README.md', ctx, 'grep Hello README.md');
		expect(ctx.addEntry).toHaveBeenCalledWith('grep Hello README.md', expect.any(Array));

		await wc.execute('', ctx, 'wc');
		expect(ctx.addEntry).toHaveBeenCalledWith('wc', [expect.stringContaining('Usage: wc')]);

		await wc.execute('README.md', ctx, 'wc README.md');
		expect(ctx.addEntry).toHaveBeenCalledWith('wc README.md', expect.any(Array));
	});

	it('systemCommands executes system commands correctly', () => {
		const whoami = systemCommands.find((c) => c.name === 'whoami')!;
		const date = systemCommands.find((c) => c.name === 'date')!;
		const uptime = systemCommands.find((c) => c.name === 'uptime')!;
		const history = systemCommands.find((c) => c.name === 'history')!;
		const echo = systemCommands.find((c) => c.name === 'echo')!;
		const calc = systemCommands.find((c) => c.name === 'calc')!;
		const neofetch = systemCommands.find((c) => c.name === 'neofetch')!;
		const theme = systemCommands.find((c) => c.name === 'theme')!;
		const lang = systemCommands.find((c) => c.name === 'lang')!;
		const reset = systemCommands.find((c) => c.name === 'reset')!;
		const exit = systemCommands.find((c) => c.name === 'exit')!;

		whoami.execute('', ctx, 'whoami');
		expect(ctx.addEntry).toHaveBeenCalledWith('whoami', ['gabriel']);

		date.execute('', ctx, 'date');
		expect(ctx.addEntry).toHaveBeenCalledWith('date', [expect.any(String)]);

		uptime.execute('', ctx, 'uptime');
		expect(ctx.addEntry).toHaveBeenCalledWith('uptime', [expect.stringContaining('up')]);

		history.execute('', ctx, 'history');
		expect(ctx.addEntry).toHaveBeenCalledWith('history', expect.any(Array));

		echo.execute('hello', ctx, 'echo hello');
		expect(ctx.addEntry).toHaveBeenCalledWith('echo hello', ['hello']);

		calc.execute('', ctx, 'calc');
		expect(ctx.addEntry).toHaveBeenCalledWith('calc', expect.arrayContaining([expect.stringContaining('Usage: calc')]));

		calc.execute('2 + 2', ctx, 'calc 2 + 2');
		expect(ctx.addEntry).toHaveBeenCalledWith('calc 2 + 2', [expect.stringContaining('4')]);

		neofetch.execute('', ctx, 'neofetch');
		expect(ctx.addEntry).toHaveBeenCalledWith('neofetch', expect.any(Array));

		theme.execute('', ctx, 'theme');
		expect(ctx.toggleTheme).toHaveBeenCalled();

		lang.execute('', ctx, 'lang');
		expect(ctx.changeLanguage).toHaveBeenCalled();

		reset.execute('', ctx, 'reset');
		expect(StorageService.clearData).toHaveBeenCalled();

		exit.execute('', ctx, 'exit');
		expect(ctx.addEntry).toHaveBeenCalledWith('exit', ['terminal.info.exitHint']);
	});

	it('navigationCommands handles route and evaluate', () => {
		const route = navigationCommands.find((c) => c.name === 'route')!;
		const evaluate = navigationCommands.find((c) => c.name === 'evaluate')!;

		route.execute('projects', ctx, 'route projects');
		expect(ctx.navigate).toHaveBeenCalledWith('/projects');

		route.execute('invalid', ctx, 'route invalid');
		expect(ctx.addEntry).toHaveBeenCalledWith('route invalid', expect.any(Array));

		evaluate.execute('', ctx, 'evaluate');
		expect(ctx.setRanking).toHaveBeenCalledWith(true);
	});

	it('networkCommands handles reviews, ping, and curl', async () => {
		const reviews = networkCommands.find((c) => c.name === 'reviews')!;
		const ping = networkCommands.find((c) => c.name === 'ping')!;
		const curl = networkCommands.find((c) => c.name === 'curl')!;

		await reviews.execute('', ctx, 'reviews');
		expect(ReviewService.findAll).toHaveBeenCalled();

		ping.execute('', ctx, 'ping');
		expect(ctx.addEntry).toHaveBeenCalledWith('ping', expect.any(Array));

		curl.execute('', ctx, 'curl');
		expect(ctx.addEntry).toHaveBeenCalledWith('curl', expect.any(Array));
	});

	it('manCommand prints manual information', () => {
		manCommand.execute('ls', ctx, 'man ls');
		expect(ctx.addEntry).toHaveBeenCalledWith('man ls', expect.arrayContaining([expect.stringContaining('LS(1)')]));
	});

	it('funCommands handles matrix, cowsay, banner', () => {
		const matrix = funCommands.find((c) => c.name === 'matrix')!;
		const cowsay = funCommands.find((c) => c.name === 'cowsay')!;
		const banner = funCommands.find((c) => c.name === 'banner')!;

		matrix.execute('', ctx, 'matrix');
		expect(ctx.addEntry).toHaveBeenCalledWith('matrix', expect.any(Array));

		cowsay.execute('hello', ctx, 'cowsay hello');
		expect(ctx.addEntry).toHaveBeenCalledWith('cowsay hello', expect.any(Array));

		banner.execute('test', ctx, 'banner test');
		expect(ctx.addEntry).toHaveBeenCalledWith('banner test', expect.any(Array));
	});
});
