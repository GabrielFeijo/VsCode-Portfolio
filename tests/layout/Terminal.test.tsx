import { render, screen, fireEvent } from '@testing-library/react';
import Terminal from '../../src/app/layout/Terminal';

jest.mock('react-icons/vsc', () => ({
    VscAdd: () => <div data-testid="vsc-add" />,
    VscClose: () => <div data-testid="vsc-close" />,
    VscEllipsis: () => <div data-testid="vsc-ellipsis" />,
    VscTrash: () => <div data-testid="vsc-trash" />,
    VscTerminalCmd: () => <div data-testid="vsc-terminal-cmd" />,
    VscSplitHorizontal: () => <div data-testid="vsc-split-horizontal" />,
    VscChevronDown: () => <div data-testid="vsc-chevron-down" />,
}));

jest.mock('src/app/components/Terminal/Problems', () => () => <div data-testid="problems" />);
jest.mock('src/app/components/Terminal/Output', () => () => <div data-testid="output" />);
jest.mock('src/app/components/Terminal/Debug', () => () => <div data-testid="debug" />);
jest.mock('src/app/components/Terminal/Cmd', () => () => <div data-testid="cmd" />);

jest.mock('../../src/contexts/ThemeContext', () => ({
    useTheme: jest.fn(),
}));

jest.mock('react-i18next', () => ({
    useTranslation: jest.fn(),
}));

const mockUseTheme = require('../../src/contexts/ThemeContext').useTheme;
const mockUseTranslation = require('react-i18next').useTranslation;

describe('Terminal', () => {
    const defaultProps = {
        language: 'en' as 'en',
        setTerminal: jest.fn(),
        setRanking: jest.fn(),
        changeLanguage: jest.fn(),
    };

    beforeEach(() => {
        mockUseTheme.mockReturnValue({
            theme: 'light',
        });
        mockUseTranslation.mockReturnValue({
            t: (key: string) => key,
        });
        defaultProps.setTerminal.mockClear();
        defaultProps.setRanking.mockClear();
        defaultProps.changeLanguage.mockClear();
    });

    it('renders the terminal with tabs', () => {
        render(<Terminal {...defaultProps} />);

        expect(screen.getByText('TERMINAL.TABS.PROBLEMS')).toBeInTheDocument();
        expect(screen.getByText('TERMINAL.TABS.OUTPUT')).toBeInTheDocument();
        expect(screen.getByText('TERMINAL.TABS.DEBUG')).toBeInTheDocument();
        expect(screen.getByText('TERMINAL.TABS.TERMINAL')).toBeInTheDocument();
    });

    it('renders terminal tab (index 3) by default', () => {
        render(<Terminal {...defaultProps} />);
        // Default selectedTerminalIndex is 3 (terminal tab)
        expect(screen.getByTestId('cmd')).toBeInTheDocument();
    });

    it('switches to output tab (index 1) when clicked', () => {
        render(<Terminal {...defaultProps} />);
        const outputTab = screen.getByText('TERMINAL.TABS.OUTPUT');
        fireEvent.click(outputTab);
        expect(screen.getByTestId('output')).toBeInTheDocument();
    });

    it('switches to debug tab (index 2) when clicked', () => {
        render(<Terminal {...defaultProps} />);
        const debugTab = screen.getByText('TERMINAL.TABS.DEBUG');
        fireEvent.click(debugTab);
        expect(screen.getByTestId('debug')).toBeInTheDocument();
    });

    it('switches to problems tab (index 0) when clicked', () => {
        render(<Terminal {...defaultProps} />);
        const problemsTab = screen.getByText('TERMINAL.TABS.PROBLEMS');
        fireEvent.click(problemsTab);
        expect(screen.getByTestId('problems')).toBeInTheDocument();
    });

    it('renders with dark theme', () => {
        mockUseTheme.mockReturnValue({
            theme: 'dark',
        });
        render(<Terminal {...defaultProps} />);
        expect(screen.getByText('TERMINAL.TABS.PROBLEMS')).toBeInTheDocument();
    });

    it('switches tab when tab is pressed with Enter', () => {
        render(<Terminal {...defaultProps} />);
        const problemsTab = screen.getByText('TERMINAL.TABS.PROBLEMS');
        fireEvent.keyDown(problemsTab, { key: 'Enter' });
        expect(screen.getByTestId('problems')).toBeInTheDocument();
    });

    it('switches tab when tab is pressed with Space', () => {
        render(<Terminal {...defaultProps} />);
        const problemsTab = screen.getByText('TERMINAL.TABS.PROBLEMS');
        fireEvent.keyDown(problemsTab, { key: ' ' });
        expect(screen.getByTestId('problems')).toBeInTheDocument();
    });

    it('does not switch tab when pressed with other key', () => {
        render(<Terminal {...defaultProps} />);
        const problemsTab = screen.getByText('TERMINAL.TABS.PROBLEMS');
        fireEvent.keyDown(problemsTab, { key: 'A' });
        // Default tab (cmd) should still be active
        expect(screen.getByTestId('cmd')).toBeInTheDocument();
    });

    it('calls setTerminal when close button is clicked', () => {
        render(<Terminal {...defaultProps} />);
        const closeButton = screen.getByTestId('vsc-close');
        fireEvent.click(closeButton);
        expect(defaultProps.setTerminal).toHaveBeenCalledWith(false);
    });

    it('calls setTerminal when close button is pressed with Enter', () => {
        render(<Terminal {...defaultProps} />);
        const closeButton = screen.getByTestId('vsc-close');
        fireEvent.keyDown(closeButton, { key: 'Enter' });
        expect(defaultProps.setTerminal).toHaveBeenCalledWith(false);
    });

    it('calls setTerminal when close button is pressed with Space', () => {
        render(<Terminal {...defaultProps} />);
        const closeButton = screen.getByTestId('vsc-close');
        fireEvent.keyDown(closeButton, { key: ' ' });
        expect(defaultProps.setTerminal).toHaveBeenCalledWith(false);
    });

    it('does not call setTerminal when close button is pressed with other key', () => {
        render(<Terminal {...defaultProps} />);
        const closeButton = screen.getByTestId('vsc-close');
        fireEvent.keyDown(closeButton, { key: 'A' });
        expect(defaultProps.setTerminal).not.toHaveBeenCalled();
    });

    it('handles keyboard on cmd button', () => {
        render(<Terminal {...defaultProps} />);
        const cmdButton = screen.getByLabelText('Open terminal command');
        fireEvent.keyDown(cmdButton, { key: 'Enter' });
    });

    it('handles keyboard on cmd button with Space', () => {
        render(<Terminal {...defaultProps} />);
        const cmdButton = screen.getByLabelText('Open terminal command');
        fireEvent.keyDown(cmdButton, { key: ' ' });
    });

    it('handles keyboard on add button', () => {
        render(<Terminal {...defaultProps} />);
        const addButton = screen.getByLabelText('Add new terminal');
        fireEvent.keyDown(addButton, { key: 'Enter' });
    });

    it('handles keyboard on split button', () => {
        render(<Terminal {...defaultProps} />);
        const splitButton = screen.getByLabelText('Split terminal');
        fireEvent.keyDown(splitButton, { key: 'Enter' });
    });

    it('handles keyboard on delete button', () => {
        render(<Terminal {...defaultProps} />);
        const deleteButton = screen.getByLabelText('Delete terminal');
        fireEvent.keyDown(deleteButton, { key: 'Enter' });
    });

    it('handles keyboard on more options button', () => {
        render(<Terminal {...defaultProps} />);
        const moreButton = screen.getByLabelText('More options');
        fireEvent.keyDown(moreButton, { key: 'Enter' });
    });
});