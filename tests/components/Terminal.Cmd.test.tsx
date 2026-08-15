import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Cmd from '../../src/app/components/Terminal/Cmd';

const navigate = jest.fn();
const toggleTheme = jest.fn();
const findAll = jest.fn();
const findAllReviews = jest.fn();
const getResponse = jest.fn();

let currentTheme: 'dark' | 'light' = 'dark';

const defaultTranslate = (key: string, opts?: Record<string, string>) => {
	if (key === 'terminal.info.navigating' && opts?.route) {
		return `navigating to ${opts.route}`;
	}
	return key;
};
let translate = defaultTranslate;

jest.mock('react-router-dom', () => ({
	useNavigate: () => navigate,
}));

jest.mock('src/contexts/ThemeContext', () => ({
	useTheme: () => ({ theme: currentTheme, toggleTheme }),
}));

jest.mock('src/services/api/review/ReviewService', () => ({
	ReviewService: { findAll: () => findAllReviews() },
}));

jest.mock('src/services/api/command/CommandService', () => ({
	CommandService: {
		getResponse: (command: string) => getResponse(command),
		findAll: () => findAll(),
	},
}));

jest.mock('react-i18next', () => ({
	useTranslation: () => ({ t: translate }),
}));

jest.mock('dayjs', () => ({
	__esModule: true,
	default: () => ({ format: () => '01/01/2026 10:30:00' }),
}));

function renderCmd(language: 'pt' | 'en' = 'pt') {
	const setRanking = jest.fn();
	const changeLanguage = jest.fn();
	render(
		<Cmd
			setRanking={setRanking}
			changeLanguage={changeLanguage}
			language={language}
		/>
	);
	return { changeLanguage, setRanking };
}

function getInput() {
	return screen.getByRole('textbox', { name: 'terminal.info.placeholder' });
}

function typeInInput(command: string) {
	fireEvent.input(getInput(), {
		target: { value: command },
		inputType: 'insertText',
		data: command,
	});
}

function submitCommand(command: string) {
	typeInInput(command);
	fireEvent.input(getInput(), {
		target: { value: `${command}\n` },
		inputType: 'insertLineBreak',
		data: null,
	});
}

describe('Cmd', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		currentTheme = 'dark';
		translate = defaultTranslate;
		findAll.mockImplementation(() => ({
			then: (resolve: (value: { command: string }[]) => void) =>
				resolve([{ command: 'projects' }]),
		}));
		findAllReviews.mockResolvedValue([]);
		getResponse.mockResolvedValue({ response: ['command response'] });
	});

	it('updates the command without executing before Enter', () => {
		renderCmd();
		typeInInput('help');
		expect(getInput()).toHaveValue('help');
		expect(getResponse).not.toHaveBeenCalled();
	});

	it('executes local help command without API call', async () => {
		renderCmd();
		submitCommand('help');
		await waitFor(() => expect(getResponse).not.toHaveBeenCalled());
		expect(getInput()).toHaveValue('');
	});

	it('executes a server command and prints its response', async () => {
		renderCmd();
		submitCommand('projects');
		await waitFor(() => expect(getResponse).toHaveBeenCalledWith('projects'));
		expect(await screen.findByText('command response')).toBeInTheDocument();
	});

	it('prints command not found when API fails', async () => {
		getResponse.mockResolvedValue(new Error('offline'));
		renderCmd();
		submitCommand('unknowncmd');
		expect(await screen.findByText(/command not found/)).toBeInTheDocument();
	});

	it('formats reviews and handles review failures', async () => {
		findAllReviews.mockResolvedValueOnce([
			{
				_id: '1',
				username: 'Gabriel',
				comment: 'Great',
				stars: 5,
				createdAt: '2026-01-01',
				updatedAt: '2026-01-01',
			},
		]);
		renderCmd();
		submitCommand('reviews');
		expect(await screen.findByText(/Great/)).toBeInTheDocument();

		findAllReviews.mockResolvedValueOnce(new Error('offline'));
		submitCommand('avaliacoes');
		await waitFor(() =>
			expect(screen.getByText('terminal.info.errorShort')).toBeInTheDocument()
		);
	});

	it('runs evaluate, theme and language commands', async () => {
		const { changeLanguage, setRanking } = renderCmd();

		submitCommand('evaluate');
		await waitFor(() => expect(setRanking).toHaveBeenCalledWith(true));

		submitCommand('mudartema');
		await waitFor(() => expect(toggleTheme).toHaveBeenCalledTimes(1));

		submitCommand('changelanguage');
		await waitFor(() => expect(changeLanguage).toHaveBeenCalledTimes(1));
	});

	it('navigates to localized routes and rejects invalid routes', async () => {
		renderCmd('en');
		submitCommand('route projects');
		await waitFor(() => expect(navigate).toHaveBeenCalledWith('/en/projects'));

		submitCommand('route invalid-page');
		expect(await screen.findByText('terminal.info.invalidRoute')).toBeInTheDocument();
	});

	it('clears previous terminal results', async () => {
		renderCmd();
		submitCommand('projects');
		expect(await screen.findByText('command response')).toBeInTheDocument();
		submitCommand('clear');
		await waitFor(() =>
			expect(screen.queryByText('command response')).not.toBeInTheDocument()
		);
	});

	it('ignores empty and one-character submissions', async () => {
		renderCmd();
		submitCommand('a');
		await waitFor(() => expect(getResponse).not.toHaveBeenCalled());
	});

	it('runs neofetch and filesystem commands locally', async () => {
		renderCmd();
		submitCommand('neofetch');
		expect(await screen.findByText(/zsh 5.9 \(oh-my-zsh\)/)).toBeInTheDocument();

		submitCommand('ls');
		expect(await screen.findByText(/src/)).toBeInTheDocument();

		submitCommand('pwd');
		expect(await screen.findByText('/home/gabriel/vscode-portfolio')).toBeInTheDocument();

		submitCommand('cat contact.txt');
		expect(await screen.findByText(/feijo6622@gmail.com/)).toBeInTheDocument();
	});

	it('supports history, echo and fun commands', async () => {
		renderCmd();
		submitCommand('echo hello terminal');
		expect(await screen.findByText('hello terminal')).toBeInTheDocument();

		submitCommand('history');
		expect((await screen.findAllByText(/echo hello terminal/)).length).toBeGreaterThanOrEqual(2);

		submitCommand('matrix');
		expect(await screen.findByText(/Wake up, Neo/)).toBeInTheDocument();
	});

	it('supports keyboard history navigation and tab completion', async () => {
		renderCmd();
		submitCommand('help');

		const input = getInput();
		fireEvent.keyDown(input, { key: 'ArrowUp' });
		expect(input).toHaveValue('help');

		fireEvent.keyDown(input, { key: 'Tab', preventDefault: jest.fn() });
		await waitFor(() => expect((input as HTMLInputElement).value.length).toBeGreaterThan(0));
	});

	it('clears output with ctrl+l', async () => {
		renderCmd();
		submitCommand('projects');
		expect(await screen.findByText('command response')).toBeInTheDocument();

		const input = getInput();
		fireEvent.keyDown(input, { key: 'l', ctrlKey: true });
		await waitFor(() =>
			expect(screen.queryByText('command response')).not.toBeInTheDocument()
		);
	});

	it('renders ghost text for a unique tab completion', async () => {
		renderCmd();
		typeInInput('mat');
		expect(await screen.findByText('rix')).toBeInTheDocument();
	});

	it('executes portuguese aliases for help and clear', async () => {
		renderCmd();
		submitCommand('ajuda');
		expect(await screen.findByText('ajuda')).toBeInTheDocument();

		submitCommand('limpar');
		await waitFor(() => expect(screen.queryByText('ajuda')).not.toBeInTheDocument());
		expect(getResponse).not.toHaveBeenCalled();
	});

	it('runs whoami, date and uptime system commands', async () => {
		renderCmd();
		submitCommand('whoami');
		expect(await screen.findByText('whoami')).toBeInTheDocument();
		expect((await screen.findAllByText('gabriel')).length).toBeGreaterThanOrEqual(2);

		submitCommand('date');
		expect(await screen.findByText('date')).toBeInTheDocument();
		expect((await screen.findAllByText(/\/\d{4}/)).length).toBeGreaterThanOrEqual(1);

		submitCommand('uptime');
		expect(await screen.findByText('uptime')).toBeInTheDocument();
		expect(await screen.findByText(/sec/)).toBeInTheDocument();
	});

	it('formats uptime with minutes when the session is long', async () => {
		const now = Date.now();
		jest.spyOn(Date, 'now').mockReturnValue(now + 61000);
		try {
			renderCmd();
			submitCommand('uptime');
			expect(await screen.findByText(/up 1 min/)).toBeInTheDocument();
		} finally {
			jest.restoreAllMocks();
		}
	});

	it('shows a message for an empty history', async () => {
		renderCmd();
		submitCommand('history');
		expect(await screen.findByText('terminal.info.emptyHistory')).toBeInTheDocument();
	});

	it('supports theme and language command aliases', async () => {
		const { changeLanguage } = renderCmd();

		submitCommand('theme');
		await waitFor(() => expect(toggleTheme).toHaveBeenCalledTimes(1));
		submitCommand('tema');
		await waitFor(() => expect(toggleTheme).toHaveBeenCalledTimes(2));
		submitCommand('changetheme');
		await waitFor(() => expect(toggleTheme).toHaveBeenCalledTimes(3));

		submitCommand('lang');
		await waitFor(() => expect(changeLanguage).toHaveBeenCalledTimes(1));
		submitCommand('idioma');
		await waitFor(() => expect(changeLanguage).toHaveBeenCalledTimes(2));
		submitCommand('mudaridioma');
		await waitFor(() => expect(changeLanguage).toHaveBeenCalledTimes(3));
	});

	it('supports avaliar and rota aliases', async () => {
		const { setRanking } = renderCmd();
		submitCommand('avaliar');
		await waitFor(() => expect(setRanking).toHaveBeenCalledWith(true));

		submitCommand('rota projects');
		await waitFor(() => expect(navigate).toHaveBeenCalledWith('/projects'));
	});

	it('changes directory to a subfolder', async () => {
		renderCmd();
		submitCommand('cd src');
		submitCommand('pwd');
		expect(await screen.findByText('/home/gabriel/vscode-portfolio/src')).toBeInTheDocument();
	});

	it('changes directory with .. and absolute paths', async () => {
		renderCmd();
		submitCommand('cd ..');
		submitCommand('pwd');
		expect(await screen.findByText('/home/gabriel')).toBeInTheDocument();

		submitCommand('cd /home/gabriel/vscode-portfolio');
		submitCommand('pwd');
		expect(await screen.findByText('/home/gabriel/vscode-portfolio')).toBeInTheDocument();
	});

	it('resolves home directory shortcuts', async () => {
		renderCmd();
		submitCommand('cd ~');
		submitCommand('pwd');
		expect(await screen.findByText('/home/gabriel')).toBeInTheDocument();

		submitCommand('cd ~/vscode-portfolio/src');
		submitCommand('pwd');
		expect(await screen.findByText('/home/gabriel/vscode-portfolio/src')).toBeInTheDocument();
	});

	it('handles cd with trailing slash and dot segments', async () => {
		renderCmd();
		submitCommand('cd src/');
		submitCommand('cd .');
		submitCommand('pwd');
		expect(await screen.findByText('/home/gabriel/vscode-portfolio/src')).toBeInTheDocument();
	});

	it('cd without arguments returns home', async () => {
		renderCmd();
		submitCommand('cd');
		submitCommand('pwd');
		expect(await screen.findByText('/home/gabriel')).toBeInTheDocument();
	});

	it('reports unknown directories', async () => {
		renderCmd();
		submitCommand('cd does-not-exist');
		expect(await screen.findByText(/No such file or directory/)).toBeInTheDocument();
	});

	it('rejects an unknown root directory', async () => {
		renderCmd();
		submitCommand('cd /');
		expect(await screen.findByText(/No such file or directory/)).toBeInTheDocument();
	});

	it('formats the date for the english locale', async () => {
		renderCmd('en');
		submitCommand('date');
		expect(await screen.findByText('date')).toBeInTheDocument();
		expect((await screen.findAllByText(/\/2026/)).length).toBeGreaterThanOrEqual(1);
	});

	it('echoes an empty line without arguments', async () => {
		renderCmd();
		submitCommand('echo');
		expect(await screen.findByText('echo')).toBeInTheDocument();
	});

	it('does nothing when navigating an empty history', async () => {
		renderCmd();
		const input = getInput();
		fireEvent.keyDown(input, { key: 'ArrowUp' });
		expect(input).toHaveValue('');
	});

	it('cat requires a filename and reports missing files', async () => {
		renderCmd();
		submitCommand('cat');
		expect(await screen.findByText(/Usage: cat <filename>/)).toBeInTheDocument();

		submitCommand('cat missing.txt');
		expect(await screen.findByText(/cat: missing\.txt: No such file/)).toBeInTheDocument();
	});

	it('runs fun commands locally', async () => {
		renderCmd();
		submitCommand('cowsay');
		expect(await screen.findByText(/Moo! I am a terminal cow/)).toBeInTheDocument();

		submitCommand('cowsay Hello');
		expect(await screen.findByText('< Hello >')).toBeInTheDocument();

		submitCommand('banner');
		expect(await screen.findByText(/GABRIEL/)).toBeInTheDocument();

		submitCommand('banner Hi');
		expect((await screen.findAllByText(/Hi/)).length).toBeGreaterThanOrEqual(2);

		submitCommand('ping');
		expect(await screen.findByText(/PING api\.gabrielfeijo\.com\.br/)).toBeInTheDocument();

		submitCommand('ping localhost');
		expect(await screen.findByText(/PING localhost/)).toBeInTheDocument();

		submitCommand('curl');
		expect(await screen.findByText(/GET https:\/\/api\.gabrielfeijo\.com\.br\/v2\//)).toBeInTheDocument();

		submitCommand('curl https://example.com');
		expect(await screen.findByText(/GET https:\/\/example\.com/)).toBeInTheDocument();

		submitCommand('man');
		expect(await screen.findByText(/HELP\(1\)/)).toBeInTheDocument();

		submitCommand('man ls');
		expect(await screen.findByText(/LS\(1\)/)).toBeInTheDocument();

		submitCommand('exit');
		expect(await screen.findByText('terminal.info.exitHint')).toBeInTheDocument();

		expect(getResponse).not.toHaveBeenCalled();
	});

	it('navigates history with arrow keys', async () => {
		renderCmd();
		submitCommand('help');
		submitCommand('ls');

		const input = getInput();
		fireEvent.keyDown(input, { key: 'ArrowUp' });
		expect(input).toHaveValue('ls');
		fireEvent.keyDown(input, { key: 'ArrowUp' });
		expect(input).toHaveValue('help');
		fireEvent.keyDown(input, { key: 'ArrowDown' });
		expect(input).toHaveValue('ls');
		fireEvent.keyDown(input, { key: 'ArrowDown' });
		expect(input).toHaveValue('');
		fireEvent.keyDown(input, { key: 'ArrowDown' });
		expect(input).toHaveValue('');
	});

	it('does not complete input without a unique match', async () => {
		renderCmd();
		const input = getInput();

		fireEvent.keyDown(input, { key: 'Tab', preventDefault: jest.fn() });
		expect(input).toHaveValue('');

		typeInInput('zzz');
		fireEvent.keyDown(input, { key: 'Tab', preventDefault: jest.fn() });
		expect(input).toHaveValue('zzz');

		typeInInput('e');
		fireEvent.keyDown(input, { key: 'Tab', preventDefault: jest.fn() });
		expect(input).toHaveValue('e');
	});

	it('maps ajuda-prefixed commands to the help API endpoint', async () => {
		renderCmd();
		submitCommand('ajudax');
		await waitFor(() => expect(getResponse).toHaveBeenCalledWith('help'));
	});

	it('shows an empty state when there are no reviews', async () => {
		renderCmd();
		submitCommand('reviews');
		expect(await screen.findByText('terminal.info.noReviews')).toBeInTheDocument();
	});

	it('builds neofetch for the light theme and english', async () => {
		currentTheme = 'light';
		renderCmd('en');
		submitCommand('neofetch');
		expect(await screen.findByText(/English \(US\)/)).toBeInTheDocument();
	});

	it('falls back to a default input label when translations are missing', async () => {
		translate = (key: string) => (key === 'terminal.info.placeholder' ? '' : key);
		renderCmd();

		expect(screen.getByRole('textbox', { name: 'Terminal command input' })).toBeInTheDocument();
	});
});
