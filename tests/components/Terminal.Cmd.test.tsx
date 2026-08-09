import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Cmd from 'src/app/components/Terminal/Cmd';

const navigate = jest.fn();
const toggleTheme = jest.fn();
const findAll = jest.fn();
const getResponse = jest.fn();

jest.mock('react-router-dom', () => ({
	useNavigate: () => navigate,
}));

jest.mock('src/contexts/ThemeContext', () => ({
	useTheme: () => ({ theme: 'dark', toggleTheme }),
}));

jest.mock('src/services/api/review/ReviewService', () => ({
	ReviewService: { findAll: () => findAll() },
}));

jest.mock('src/services/api/command/CommandService', () => ({
	CommandService: { getResponse: (command: string) => getResponse(command) },
}));

jest.mock('react-i18next', () => ({
	useTranslation: () => ({ t: (key: string) => key }),
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

function submitCommand(command: string) {
	const input = screen.getByRole('textbox', {
		name: 'terminal.info.placeholder',
	});
	fireEvent.input(input, {
		target: { value: command },
		inputType: 'insertText',
		data: command,
	});
	fireEvent.input(input, {
		target: { value: `${command}\n` },
		inputType: 'insertLineBreak',
		data: null,
	});
}

describe('Cmd', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		findAll.mockResolvedValue([]);
		getResponse.mockResolvedValue({ response: ['command response'] });
	});

	it('updates the command without executing before Enter', () => {
		renderCmd();
		const input = screen.getByRole('textbox');

		fireEvent.input(input, {
			target: { value: 'help' },
			inputType: 'insertText',
			data: 'help',
		});

		expect(input).toHaveValue('help');
		expect(getResponse).not.toHaveBeenCalled();
	});

	it('executes a server command and prints its response', async () => {
		renderCmd();
		submitCommand('help');

		await waitFor(() => expect(getResponse).toHaveBeenCalledWith('help'));
		expect(await screen.findByText('command response')).toBeInTheDocument();
		expect(screen.getByRole('textbox')).toHaveValue('');
	});

	it('prints an error when a server command fails', async () => {
		getResponse.mockResolvedValue(new Error('offline'));
		renderCmd();
		submitCommand('unknown');

		expect(await screen.findByText('terminal.info.error')).toBeInTheDocument();
	});

	it('formats reviews and handles review failures', async () => {
		findAll.mockResolvedValueOnce([
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

		expect(
			await screen.findByText(/01\/01\/2026 10:30:00 - \[Gabriel\] Great/)
		).toBeInTheDocument();

		findAll.mockResolvedValueOnce(new Error('offline'));
		submitCommand('avaliacoes');
		await waitFor(() =>
			expect(screen.getAllByText('terminal.info.error')).toHaveLength(1)
		);
	});

	it('runs evaluate, theme and language commands', async () => {
		const { changeLanguage, setRanking } = renderCmd();

		submitCommand('evaluate');
		await waitFor(() => expect(setRanking).toHaveBeenCalledWith(true));

		submitCommand('mudartema');
		await waitFor(() => expect(toggleTheme).toHaveBeenCalledTimes(1));
		expect(await screen.findByText('terminal.info.theme')).toBeInTheDocument();

		submitCommand('changelanguage');
		await waitFor(() => expect(changeLanguage).toHaveBeenCalledTimes(1));
		expect(await screen.findByText('terminal.info.language')).toBeInTheDocument();
	});

	it('navigates to localized routes', async () => {
		renderCmd('en');
		submitCommand('route projects');

		await waitFor(() => expect(navigate).toHaveBeenCalledWith('/en/projects'));
		expect(getResponse).not.toHaveBeenCalled();
	});

	it('clears previous terminal results', async () => {
		renderCmd();
		submitCommand('help');
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
});
