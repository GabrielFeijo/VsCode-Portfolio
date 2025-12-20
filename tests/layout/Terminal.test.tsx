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
        selectedTerminalIndex: 0,
        setSelectedTerminalIndex: jest.fn(),
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
        defaultProps.setSelectedTerminalIndex.mockClear();
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

    it('renders with selectedTerminalIndex 1', () => {
        render(<Terminal {...defaultProps} selectedTerminalIndex={1} />);
        expect(screen.getByTestId('output')).toBeInTheDocument();
    });

    it('renders with selectedTerminalIndex 2', () => {
        render(<Terminal {...defaultProps} selectedTerminalIndex={2} />);
        expect(screen.getByTestId('debug')).toBeInTheDocument();
    });

    it('renders with selectedTerminalIndex 3', () => {
        render(<Terminal {...defaultProps} selectedTerminalIndex={3} />);
        expect(screen.getByTestId('cmd')).toBeInTheDocument();
    });

    it('calls setSelectedTerminalIndex when tab is pressed with Enter', () => {
        render(<Terminal {...defaultProps} />);
        const problemsTab = screen.getByText('TERMINAL.TABS.PROBLEMS');
        fireEvent.keyDown(problemsTab, { key: 'Enter' });
        expect(defaultProps.setSelectedTerminalIndex).toHaveBeenCalledWith(0);
    });

    it('calls setSelectedTerminalIndex when tab is pressed with Space', () => {
        render(<Terminal {...defaultProps} />);
        const problemsTab = screen.getByText('TERMINAL.TABS.PROBLEMS');
        fireEvent.keyDown(problemsTab, { key: ' ' });
        expect(defaultProps.setSelectedTerminalIndex).toHaveBeenCalledWith(0);
    });

    it('does not call setSelectedTerminalIndex when tab is pressed with other key', () => {
        render(<Terminal {...defaultProps} />);
        const problemsTab = screen.getByText('TERMINAL.TABS.PROBLEMS');
        fireEvent.keyDown(problemsTab, { key: 'A' });
        expect(defaultProps.setSelectedTerminalIndex).not.toHaveBeenCalled();
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

    it('handles keyboard on cmd button', () => {
        render(<Terminal {...defaultProps} />);
        const cmdButton = screen.getByLabelText('Open terminal command');
        fireEvent.keyDown(cmdButton, { key: 'Enter' });
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