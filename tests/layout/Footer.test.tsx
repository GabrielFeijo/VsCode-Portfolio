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
});