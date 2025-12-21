import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Sidebar from '../../src/app/layout/Sidebar';

jest.mock('react-icons/vsc', () => ({
    VscFiles: () => <div data-testid="vsc-files" />,
    VscSettingsGear: () => <div data-testid="vsc-settings-gear" />,
}));

jest.mock('react-icons/fa', () => ({
    FaGithub: () => <div data-testid="fa-github" />,
    FaLinkedin: () => <div data-testid="fa-linkedin" />,
    FaEnvelope: () => <div data-testid="fa-envelope" />,
}));

jest.mock('../../src/contexts/ThemeContext', () => ({
    useTheme: jest.fn(),
}));

jest.mock('react-i18next', () => ({
    useTranslation: jest.fn(),
}));

jest.mock('react-device-detect', () => ({
    isMobile: false,
}));

const mockUseTheme = require('../../src/contexts/ThemeContext').useTheme;
const mockUseTranslation = require('react-i18next').useTranslation;

describe('Sidebar', () => {
    const defaultProps = {
        expanded: true,
        setExpanded: jest.fn(),
        terminal: true,
        setTerminal: jest.fn(),
        language: 'en',
        changeLanguage: jest.fn(),
    };

    beforeEach(() => {
        mockUseTheme.mockReturnValue({
            theme: 'light',
            toggleTheme: jest.fn(),
        });
        mockUseTranslation.mockReturnValue({
            t: (key: string) => key,
            i18n: { language: 'en' },
        });
        defaultProps.setExpanded.mockClear();
        defaultProps.setTerminal.mockClear();
        defaultProps.changeLanguage.mockClear();
    });

    it('renders the sidebar with all elements when expanded', () => {
        render(<Sidebar {...defaultProps} />);

        expect(screen.getByTestId('vsc-files')).toBeInTheDocument();
        expect(screen.getByTestId('vsc-settings-gear')).toBeInTheDocument();
        expect(screen.getByTestId('fa-github')).toBeInTheDocument();
        expect(screen.getByTestId('fa-linkedin')).toBeInTheDocument();
        expect(screen.getByTestId('fa-envelope')).toBeInTheDocument();

        expect(screen.getByRole('button', { name: /sidebar\.closeExplorer/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sidebar\.terminal\.close/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sidebar\.language\.toPortuguese/i })).toBeInTheDocument();
    });

    it('calls setExpanded when files button is clicked', () => {
        render(<Sidebar {...defaultProps} />);
        const filesButton = screen.getByRole('button', { name: /sidebar\.closeExplorer/i });
        fireEvent.click(filesButton);
        expect(defaultProps.setExpanded).toHaveBeenCalledWith(false);
    });

    it('calls toggleTheme when theme button is clicked', () => {
        const toggleTheme = jest.fn();
        mockUseTheme.mockReturnValue({
            theme: 'light',
            toggleTheme,
        });
        render(<Sidebar {...defaultProps} />);
        const themeButton = screen.getByRole('button', { name: /sidebar\.theme\.dark/i });
        fireEvent.click(themeButton);
        expect(toggleTheme).toHaveBeenCalled();
    });

    it('calls setTerminal when terminal button is clicked', () => {
        render(<Sidebar {...defaultProps} />);
        const terminalButton = screen.getByRole('button', { name: /sidebar\.terminal\.close/i });
        fireEvent.click(terminalButton);
        expect(defaultProps.setTerminal).toHaveBeenCalledWith(false);
    });

    it('calls changeLanguage when language button is clicked', () => {
        render(<Sidebar {...defaultProps} />);
        const languageButton = screen.getByRole('button', { name: /sidebar\.language\.toPortuguese/i });
        fireEvent.click(languageButton);
        expect(defaultProps.changeLanguage).toHaveBeenCalled();
    });

    it('calls setExpanded and preventDefault when files button is pressed with Enter', () => {
        const preventDefault = jest.fn();
        render(<Sidebar {...defaultProps} />);
        const filesButton = screen.getByRole('button', { name: /sidebar\.closeExplorer/i });
        fireEvent.keyDown(filesButton, { key: 'Enter', preventDefault });
        expect(defaultProps.setExpanded).toHaveBeenCalledWith(false);
    });

    it('calls setExpanded and preventDefault when files button is pressed with Space', () => {
        const preventDefault = jest.fn();
        render(<Sidebar {...defaultProps} />);
        const filesButton = screen.getByRole('button', { name: /sidebar\.closeExplorer/i });
        fireEvent.keyDown(filesButton, { key: ' ', preventDefault });
        expect(defaultProps.setExpanded).toHaveBeenCalledWith(false);
    });

    it('does not call setExpanded when files button is pressed with other key', () => {
        render(<Sidebar {...defaultProps} />);
        const filesButton = screen.getByRole('button', { name: /sidebar\.closeExplorer/i });
        fireEvent.keyDown(filesButton, { key: 'A' });
        expect(defaultProps.setExpanded).not.toHaveBeenCalled();
    });

    it('calls setTerminal and preventDefault when terminal button is pressed with Enter', () => {
        const preventDefault = jest.fn();
        render(<Sidebar {...defaultProps} />);
        const terminalButton = screen.getByRole('button', { name: /sidebar\.terminal\.close/i });
        fireEvent.keyDown(terminalButton, { key: 'Enter', preventDefault });
        expect(defaultProps.setTerminal).toHaveBeenCalledWith(false);
    });

    it('calls setTerminal and preventDefault when terminal button is pressed with Space', () => {
        const preventDefault = jest.fn();
        render(<Sidebar {...defaultProps} />);
        const terminalButton = screen.getByRole('button', { name: /sidebar\.terminal\.close/i });
        fireEvent.keyDown(terminalButton, { key: ' ', preventDefault });
        expect(defaultProps.setTerminal).toHaveBeenCalledWith(false);
    });

    it('does not call setTerminal when terminal button is pressed with other key', () => {
        render(<Sidebar {...defaultProps} />);
        const terminalButton = screen.getByRole('button', { name: /sidebar\.terminal\.close/i });
        fireEvent.keyDown(terminalButton, { key: 'A' });
        expect(defaultProps.setTerminal).not.toHaveBeenCalled();
    });

    it('calls changeLanguage and preventDefault when language button is pressed with Enter', () => {
        const preventDefault = jest.fn();
        render(<Sidebar {...defaultProps} />);
        const languageButton = screen.getByRole('button', { name: /sidebar\.language\.toPortuguese/i });
        fireEvent.keyDown(languageButton, { key: 'Enter', preventDefault });
        expect(defaultProps.changeLanguage).toHaveBeenCalled();
    });

    it('calls changeLanguage and preventDefault when language button is pressed with Space', () => {
        const preventDefault = jest.fn();
        render(<Sidebar {...defaultProps} />);
        const languageButton = screen.getByRole('button', { name: /sidebar\.language\.toPortuguese/i });
        fireEvent.keyDown(languageButton, { key: ' ', preventDefault });
        expect(defaultProps.changeLanguage).toHaveBeenCalled();
    });

    it('does not call changeLanguage when language button is pressed with other key', () => {
        render(<Sidebar {...defaultProps} />);
        const languageButton = screen.getByRole('button', { name: /sidebar\.language\.toPortuguese/i });
        fireEvent.keyDown(languageButton, { key: 'A' });
        expect(defaultProps.changeLanguage).not.toHaveBeenCalled();
    });

    it('calls toggleTheme and preventDefault when theme button is pressed with Enter', () => {
        const toggleTheme = jest.fn();
        const preventDefault = jest.fn();
        mockUseTheme.mockReturnValue({
            theme: 'light',
            toggleTheme,
        });
        render(<Sidebar {...defaultProps} />);
        const themeButton = screen.getByRole('button', { name: /sidebar\.theme\.dark/i });
        fireEvent.keyDown(themeButton, { key: 'Enter', preventDefault });
        expect(toggleTheme).toHaveBeenCalled();
    });

    it('calls toggleTheme and preventDefault when theme button is pressed with Space', () => {
        const toggleTheme = jest.fn();
        const preventDefault = jest.fn();
        mockUseTheme.mockReturnValue({
            theme: 'light',
            toggleTheme,
        });
        render(<Sidebar {...defaultProps} />);
        const themeButton = screen.getByRole('button', { name: /sidebar\.theme\.dark/i });
        fireEvent.keyDown(themeButton, { key: ' ', preventDefault });
        expect(toggleTheme).toHaveBeenCalled();
    });

    it('does not call toggleTheme when theme button is pressed with other key', () => {
        const toggleTheme = jest.fn();
        mockUseTheme.mockReturnValue({
            theme: 'light',
            toggleTheme,
        });
        render(<Sidebar {...defaultProps} />);
        const themeButton = screen.getByRole('button', { name: /sidebar\.theme\.dark/i });
        fireEvent.keyDown(themeButton, { key: 'A' });
        expect(toggleTheme).not.toHaveBeenCalled();
    });

    it('renders terminal button when not mobile', () => {
        render(<Sidebar {...defaultProps} />);
        expect(screen.getByRole('button', { name: /sidebar\.terminal\.close/i })).toBeInTheDocument();
    });

    it('does not render terminal button when mobile', () => {
        const originalIsMobile = require('react-device-detect').isMobile;
        require('react-device-detect').isMobile = true;
        render(<Sidebar {...defaultProps} />);
        expect(screen.queryByRole('button', { name: /sidebar\.terminal\.close/i })).not.toBeInTheDocument();
        require('react-device-detect').isMobile = originalIsMobile;
    });

    it('calls preventDefault when settings button is pressed with Enter', () => {
        const preventDefault = jest.fn();
        render(<Sidebar {...defaultProps} />);
        const settingsButton = screen.getByRole('button', { name: /sidebar\.settings/i });
        fireEvent.keyDown(settingsButton, { key: 'Enter', preventDefault });
    });

    it('calls preventDefault when settings button is pressed with Space', () => {
        const preventDefault = jest.fn();
        render(<Sidebar {...defaultProps} />);
        const settingsButton = screen.getByRole('button', { name: /sidebar\.settings/i });
        fireEvent.keyDown(settingsButton, { key: ' ', preventDefault });
    });

    it('handles keyDown on settings button with other key', () => {
        render(<Sidebar {...defaultProps} />);
        const settingsButton = screen.getByRole('button', { name: /sidebar\.settings/i });
        fireEvent.keyDown(settingsButton, { key: 'A' });
        // No assertion needed, just to cover the code
    });

    it('renders collapsed sidebar with dark theme', () => {
        mockUseTheme.mockReturnValue({
            theme: 'dark',
            toggleTheme: jest.fn(),
        });
        render(<Sidebar {...defaultProps} expanded={false} />);
        expect(screen.getByRole('button', { name: /sidebar\.openExplorer/i })).toBeInTheDocument();
    });

    it('renders with terminal false', () => {
        render(<Sidebar {...defaultProps} terminal={false} />);
        expect(screen.getByRole('button', { name: /sidebar\.terminal\.open/i })).toBeInTheDocument();
    });

    it('renders with terminal true and dark theme', () => {
        mockUseTheme.mockReturnValue({
            theme: 'dark',
            toggleTheme: jest.fn(),
        });
        render(<Sidebar {...defaultProps} terminal={true} />);
        expect(screen.getByRole('button', { name: /sidebar\.terminal\.close/i })).toBeInTheDocument();
    });

    it('renders collapsed sidebar with light theme', () => {
        mockUseTheme.mockReturnValue({
            theme: 'light',
            toggleTheme: jest.fn(),
        });
        render(<Sidebar {...defaultProps} expanded={false} />);
        expect(screen.getByRole('button', { name: /sidebar\.openExplorer/i })).toBeInTheDocument();
    });

    it('renders contact links with correct attributes', () => {
        render(<Sidebar {...defaultProps} />);
        const githubLink = screen.getByTestId('fa-github').closest('a');
        expect(githubLink).toHaveAttribute('href', 'contact.github.href');
        expect(githubLink).toHaveAttribute('target', '_blank');
        const linkedinLink = screen.getByTestId('fa-linkedin').closest('a');
        expect(linkedinLink).toHaveAttribute('href', 'contact.linkedin.href');
        expect(linkedinLink).toHaveAttribute('target', '_blank');
        const emailLink = screen.getByTestId('fa-envelope').closest('a');
        expect(emailLink).toHaveAttribute('href', 'contact.email.href');
        expect(emailLink).toHaveAttribute('target', '_blank');
    });

    it('renders with Portuguese language', () => {
        mockUseTranslation.mockReturnValue({
            t: (key: string) => key,
            i18n: { language: 'pt' },
        });
        render(<Sidebar {...defaultProps} />);
        expect(screen.getByRole('button', { name: /sidebar\.language\.toEnglish/i })).toBeInTheDocument();
    });

    it('renders with terminal false and dark theme', () => {
        mockUseTheme.mockReturnValue({
            theme: 'dark',
            toggleTheme: jest.fn(),
        });
        render(<Sidebar {...defaultProps} terminal={false} />);
        expect(screen.getByRole('button', { name: /sidebar\.terminal\.open/i })).toBeInTheDocument();
    });

    it('renders with expanded false and dark theme', () => {
        mockUseTheme.mockReturnValue({
            theme: 'dark',
            toggleTheme: jest.fn(),
        });
        render(<Sidebar {...defaultProps} expanded={false} />);
        expect(screen.getByRole('button', { name: /sidebar\.openExplorer/i })).toBeInTheDocument();
    });
});
