import { render, screen } from '@testing-library/react';
import Footer from '../../src/app/layout/Footer';

jest.mock('react-icons/vsc', () => ({
    VscRemote: () => <div data-testid="vsc-remote" />,
    VscError: () => <div data-testid="vsc-error" />,
    VscWarning: () => <div data-testid="vsc-warning" />,
    VscBell: () => <div data-testid="vsc-bell" />,
    VscFeedback: () => <div data-testid="vsc-feedback" />,
    VscCheck: () => <div data-testid="vsc-check" />,
}));

jest.mock('react-icons/io', () => ({
    IoIosGitBranch: () => <div data-testid="io-git-branch" />,
}));

describe('Footer', () => {
    it('renders the footer with all elements', () => {
        render(<Footer />);

        expect(screen.getByRole('button', { name: /remote connection status/i })).toBeInTheDocument();
        expect(screen.getByTestId('vsc-remote')).toBeInTheDocument();

        expect(screen.getByTestId('vsc-error')).toBeInTheDocument();
        expect(screen.getByTestId('vsc-warning')).toBeInTheDocument();
        expect(screen.getByTestId('vsc-bell')).toBeInTheDocument();
        expect(screen.getByTestId('vsc-feedback')).toBeInTheDocument();
        expect(screen.getByTestId('vsc-check')).toBeInTheDocument();
        expect(screen.getByTestId('io-git-branch')).toBeInTheDocument();

        expect(screen.getByText('main')).toBeInTheDocument();
        expect(screen.getAllByText('0')).toHaveLength(2);
        expect(screen.getByText('Prettier')).toBeInTheDocument();
    });

    it('renders the remote connection button with correct properties', () => {
        render(<Footer />);

        const button = screen.getByRole('button', { name: /remote connection status/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('aria-label', 'Remote connection status');
        expect(button).toHaveAttribute('tabIndex', '0');
    });

    it('renders the GitHub link with correct attributes', () => {
        render(<Footer />);

        const link = screen.getByRole('link', { name: /view source code on github - main branch/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'https://github.com/GabrielFeijo');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('renders the errors and warnings status with correct aria labels', () => {
        render(<Footer />);

        const status = screen.getByRole('status', { name: /errors and warnings count/i });
        expect(status).toBeInTheDocument();

        expect(screen.getByLabelText('Errors count')).toHaveTextContent('0');
        expect(screen.getByLabelText('Warnings count')).toHaveTextContent('0');
    });

    it('renders the Prettier status correctly', () => {
        render(<Footer />);

        const prettierBox = screen.getByText('Prettier').closest('div');
        expect(prettierBox).toBeInTheDocument();
        expect(screen.getByTestId('vsc-check')).toBeInTheDocument();
    });

    it('renders the feedback and bell icons in the right section', () => {
        render(<Footer />);

        expect(screen.getByTestId('vsc-feedback')).toBeInTheDocument();
        expect(screen.getByTestId('vsc-bell')).toBeInTheDocument();
    });
});