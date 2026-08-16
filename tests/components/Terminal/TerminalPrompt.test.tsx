import { render } from '@testing-library/react';
import TerminalPrompt from '../../../src/app/components/Terminal/terminal/TerminalPrompt';

jest.mock('src/contexts/ThemeContext', () => ({
	useTheme: () => ({ theme: 'dark', toggleTheme: jest.fn() }),
}));

describe('TerminalPrompt', () => {
	it('renders with default empty cwd', () => {
		const { container } = render(<TerminalPrompt cwd="" isDark={true} />);
		expect(container).toBeInTheDocument();
	});
});
