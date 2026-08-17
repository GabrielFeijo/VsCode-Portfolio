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
				'/': [
					{ name: 'rootfile.txt', type: 'file', content: ['root content'] },
				],
				'/home/gabriel': [
					{ name: 'portfolio', type: 'dir' },
				],
				'/home/gabriel/portfolio': [
					{ name: 'README.md', type: 'file', content: ['# Title', 'Hello World', 'Line 3', 'Line 4'] },
					{ name: 'src', type: 'dir' },
				],
				'/home/gabriel/portfolio/src': [],
			},
			setFs: jest.fn((updater) => {
				if (typeof updater === 'function') {
					ctx.fs = updater(ctx.fs);
				}
			}),
			apiCommandList: ['api-test', 'cmd1', 'cmd2', 'cmd3', 'cmd4', 'cmd5', 'cmd6', 'cmd7', 'cmd8', 'cmd9'],
			openEditor: jest.fn(),
		};
	});

	it('helpCommand displays help information and falls back when apiCommandList is missing', () => {
		helpCommand.execute('', ctx, 'help');
		expect(ctx.addEntry).toHaveBeenCalledWith('help', expect.any(Array));

		const ctxWithoutApi: CommandExecutionContext = { ...ctx, apiCommandList: undefined };
		helpCommand.execute('', ctxWithoutApi, 'help');
		expect(ctxWithoutApi.addEntry).toHaveBeenCalledWith('help', expect.any(Array));
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

	it('treeCommand generates directory tree and handles errors', () => {
		treeCommand.execute('', ctx, 'tree');
		expect(ctx.addEntry).toHaveBeenCalledWith('tree', expect.any(Array));

		treeCommand.execute('invalid-path', ctx, 'tree invalid-path');
		expect(ctx.addEntry).toHaveBeenCalledWith(
			'tree invalid-path',
			[expect.stringContaining('No such directory')],
			ctx.terminalColors.error,
		);
	});

	it('cdCommand changes directories, handles home path (~), previous cwd (-), and non-existent dirs', () => {
		cdCommand.execute('src', ctx, 'cd src');
		expect(ctx.setCwd).toHaveBeenCalledWith('/home/gabriel/portfolio/src');
		expect(ctx.setPreviousCwd).toHaveBeenCalledWith('/home/gabriel/portfolio');

		cdCommand.execute('', ctx, 'cd');
		expect(ctx.setCwd).toHaveBeenCalledWith('/home/gabriel');

		cdCommand.execute('~', ctx, 'cd ~');
		expect(ctx.setCwd).toHaveBeenCalledWith('/home/gabriel');

		cdCommand.execute('-', ctx, 'cd -');
		expect(ctx.setCwd).toHaveBeenCalledWith('/home/gabriel');
		expect(ctx.addEntry).toHaveBeenCalledWith('cd -', ['/home/gabriel']);

		const ctxNoPrev: CommandExecutionContext = { ...ctx, previousCwd: '' };
		cdCommand.execute('-', ctxNoPrev, 'cd -');
		expect(ctxNoPrev.setCwd).toHaveBeenCalled();

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

		await nano.execute('/rootfile.txt', ctx, 'nano /rootfile.txt');
		expect(ctx.openEditor).toHaveBeenCalledWith(expect.objectContaining({ fileName: 'rootfile.txt' }));

		code.execute('.', ctx, 'code .');
		expect(ctx.addEntry).toHaveBeenCalledWith('code .', [expect.stringContaining('Opening workspace')]);

		code.execute('README.md', ctx, 'code README.md');
		expect(ctx.addEntry).toHaveBeenCalledWith('code README.md', [expect.stringContaining('Opening README.md')]);
	});

	it('filesystemCommands handles touch, mkdir, rm with edge cases', () => {
		const touch = filesystemCommands.find((c) => c.name === 'touch')!;
		const mkdir = filesystemCommands.find((c) => c.name === 'mkdir')!;
		const rm = filesystemCommands.find((c) => c.name === 'rm')!;

		touch.execute('', ctx, 'touch');
		expect(ctx.addEntry).toHaveBeenCalledWith('touch', [expect.stringContaining('Usage: touch')]);

		touch.execute('/invalid-parent/file.txt', ctx, 'touch /invalid-parent/file.txt');
		expect(ctx.addEntry).toHaveBeenCalledWith('touch /invalid-parent/file.txt', [expect.stringContaining('No such file or directory')], ctx.terminalColors.error);

		touch.execute('/root_new.txt', ctx, 'touch /root_new.txt');
		expect(ctx.setFs).toHaveBeenCalled();

		touch.execute('newfile.txt', ctx, 'touch newfile.txt');
		expect(ctx.setFs).toHaveBeenCalled();

		touch.execute('README.md', ctx, 'touch README.md');
		expect(ctx.setFs).toHaveBeenCalled();

		mkdir.execute('', ctx, 'mkdir');
		expect(ctx.addEntry).toHaveBeenCalledWith('mkdir', [expect.stringContaining('Usage: mkdir')]);

		mkdir.execute('/invalid-parent/newdir', ctx, 'mkdir /invalid-parent/newdir');
		expect(ctx.addEntry).toHaveBeenCalledWith('mkdir /invalid-parent/newdir', [expect.stringContaining('No such file or directory')], ctx.terminalColors.error);

		mkdir.execute('/rootdir_new', ctx, 'mkdir /rootdir_new');
		expect(ctx.setFs).toHaveBeenCalled();

		mkdir.execute('newdir', ctx, 'mkdir newdir');
		expect(ctx.setFs).toHaveBeenCalled();

		mkdir.execute('src', ctx, 'mkdir src');
		expect(ctx.setFs).toHaveBeenCalled();

		rm.execute('', ctx, 'rm');
		expect(ctx.addEntry).toHaveBeenCalledWith('rm', [expect.stringContaining('Usage: rm')]);

		rm.execute('src', ctx, 'rm src');
		expect(ctx.addEntry).toHaveBeenCalledWith('rm src', [expect.stringContaining('Is a directory')], ctx.terminalColors.error);

		rm.execute('-r src', ctx, 'rm -r src');
		expect(ctx.setFs).toHaveBeenCalled();

		rm.execute('/rootfile.txt', ctx, 'rm /rootfile.txt');
		expect(ctx.setFs).toHaveBeenCalled();

		rm.execute('README.md', ctx, 'rm README.md');
		expect(ctx.setFs).toHaveBeenCalled();
	});

	it('textUtilsCommands handles head, tail, grep, wc with various flags', async () => {
		const head = textUtilsCommands.find((c) => c.name === 'head')!;
		const grep = textUtilsCommands.find((c) => c.name === 'grep')!;
		const wc = textUtilsCommands.find((c) => c.name === 'wc')!;

		await head.execute('', ctx, 'head');
		expect(ctx.addEntry).toHaveBeenCalledWith('head', [expect.stringContaining('Usage: head')]);

		await head.execute('-n 2 README.md', ctx, 'head -n 2 README.md');
		expect(ctx.addEntry).toHaveBeenCalledWith('head -n 2 README.md', ['# Title', 'Hello World']);

		await head.execute('-n2 README.md', ctx, 'head -n2 README.md');
		expect(ctx.addEntry).toHaveBeenCalledWith('head -n2 README.md', ['# Title', 'Hello World']);

		await head.execute('-n abc README.md', ctx, 'head -n abc README.md');
		expect(ctx.addEntry).toHaveBeenCalledWith('head -n abc README.md', ['# Title', 'Hello World', 'Line 3', 'Line 4']);

		await head.execute('-nabc README.md', ctx, 'head -nabc README.md');
		expect(ctx.addEntry).toHaveBeenCalledWith('head -nabc README.md', ['# Title', 'Hello World', 'Line 3', 'Line 4']);

		await head.execute('/rootfile.txt', ctx, 'head /rootfile.txt');
		expect(ctx.addEntry).toHaveBeenCalledWith('head /rootfile.txt', ['root content']);

		await head.execute('missing.txt', ctx, 'head missing.txt');
		expect(ctx.addEntry).toHaveBeenCalledWith('head missing.txt', [expect.stringContaining('No such file')], ctx.terminalColors.error);

		await head.execute('-n 2 README.md', ctx, 'tail -n 2 README.md');
		expect(ctx.addEntry).toHaveBeenCalledWith('tail -n 2 README.md', ['Line 3', 'Line 4']);

		await grep.execute('', ctx, 'grep');
		expect(ctx.addEntry).toHaveBeenCalledWith('grep', [expect.stringContaining('Usage: grep')]);

		await grep.execute('-i hello README.md', ctx, 'grep -i hello README.md');
		expect(ctx.addEntry).toHaveBeenCalledWith('grep -i hello README.md', expect.any(Array));

		await grep.execute('root /rootfile.txt', ctx, 'grep root /rootfile.txt');
		expect(ctx.addEntry).toHaveBeenCalledWith('grep root /rootfile.txt', expect.any(Array));

		await grep.execute('nonexistent README.md', ctx, 'grep nonexistent README.md');
		expect(ctx.addEntry).toHaveBeenCalledWith('grep nonexistent README.md', []);

		await grep.execute('pattern missing.txt', ctx, 'grep pattern missing.txt');
		expect(ctx.addEntry).toHaveBeenCalledWith('grep pattern missing.txt', [expect.stringContaining('No such file')], ctx.terminalColors.error);

		await wc.execute('', ctx, 'wc');
		expect(ctx.addEntry).toHaveBeenCalledWith('wc', [expect.stringContaining('Usage: wc')]);

		await wc.execute('-l README.md', ctx, 'wc -l README.md');
		expect(ctx.addEntry).toHaveBeenCalledWith('wc -l README.md', [expect.stringContaining('4 README.md')]);

		await wc.execute('/rootfile.txt', ctx, 'wc /rootfile.txt');
		expect(ctx.addEntry).toHaveBeenCalledWith('wc /rootfile.txt', expect.any(Array));

		await wc.execute('README.md', ctx, 'wc README.md');
		expect(ctx.addEntry).toHaveBeenCalledWith('wc README.md', expect.any(Array));

		await wc.execute('missing.txt', ctx, 'wc missing.txt');
		expect(ctx.addEntry).toHaveBeenCalledWith('wc missing.txt', [expect.stringContaining('No such file')], ctx.terminalColors.error);
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

		const ctxEn: CommandExecutionContext = { ...ctx, language: 'en' };
		date.execute('', ctxEn, 'date');
		expect(ctxEn.addEntry).toHaveBeenCalledWith('date', [expect.any(String)]);

		uptime.execute('', ctx, 'uptime');
		expect(ctx.addEntry).toHaveBeenCalledWith('uptime', [expect.stringContaining('up')]);

		history.execute('', ctx, 'history');
		expect(ctx.addEntry).toHaveBeenCalledWith('history', expect.any(Array));

		const ctxEmptyHist: CommandExecutionContext = { ...ctx, history: [] };
		history.execute('', ctxEmptyHist, 'history');
		expect(ctxEmptyHist.addEntry).toHaveBeenCalledWith('history', ['terminal.info.emptyHistory']);

		echo.execute('hello', ctx, 'echo hello');
		expect(ctx.addEntry).toHaveBeenCalledWith('echo hello', ['hello']);

		calc.execute('', ctx, 'calc');
		expect(ctx.addEntry).toHaveBeenCalledWith('calc', expect.arrayContaining([expect.stringContaining('Usage: calc')]));

		calc.execute('2 + 2', ctx, 'calc 2 + 2');
		expect(ctx.addEntry).toHaveBeenCalledWith('calc 2 + 2', [expect.stringContaining('4')]);

		calc.execute('invalid ++++', ctx, 'calc invalid ++++');
		expect(ctx.addEntry).toHaveBeenCalledWith('calc invalid ++++', [expect.stringContaining('invalid expression')], ctx.terminalColors.error);

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

		(ReviewService.findAll as jest.Mock).mockResolvedValueOnce(new Error('api down'));
		await reviews.execute('', ctx, 'reviews');
		expect(ctx.addEntry).toHaveBeenCalledWith('reviews', [expect.stringContaining('errorShort')], ctx.terminalColors.error);

		ping.execute('', ctx, 'ping');
		expect(ctx.addEntry).toHaveBeenCalledWith('ping', expect.any(Array));

		curl.execute('', ctx, 'curl');
		expect(ctx.addEntry).toHaveBeenCalledWith('curl', expect.any(Array));
	});

	it('manCommand prints manual information', () => {
		manCommand.execute('ls', ctx, 'man ls');
		expect(ctx.addEntry).toHaveBeenCalledWith('man ls', expect.arrayContaining([expect.stringContaining('LS(1)')]));

		manCommand.execute('', ctx, 'man');
		expect(ctx.addEntry).toHaveBeenCalledWith('man', expect.arrayContaining([expect.stringContaining('HELP(1)')]));
	});

	it('funCommands handles matrix, cowsay, banner', () => {
		const matrix = funCommands.find((c) => c.name === 'matrix')!;
		const cowsay = funCommands.find((c) => c.name === 'cowsay')!;
		const banner = funCommands.find((c) => c.name === 'banner')!;

		matrix.execute('', ctx, 'matrix');
		expect(ctx.addEntry).toHaveBeenCalledWith('matrix', expect.any(Array));

		cowsay.execute('hello', ctx, 'cowsay hello');
		expect(ctx.addEntry).toHaveBeenCalledWith('cowsay hello', expect.any(Array));

		cowsay.execute('', ctx, 'cowsay');
		expect(ctx.addEntry).toHaveBeenCalledWith('cowsay', expect.any(Array));

		banner.execute('test', ctx, 'banner test');
		expect(ctx.addEntry).toHaveBeenCalledWith('banner test', expect.any(Array));

		banner.execute('', ctx, 'banner');
		expect(ctx.addEntry).toHaveBeenCalledWith('banner', expect.any(Array));
	});
});
