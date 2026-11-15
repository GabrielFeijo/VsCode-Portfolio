import { render, screen } from '@testing-library/react';
import Footer from '../../src/app/layout/Footer';
import { siteConfig } from '../../src/config/site';

jest.mock('react-icons/vsc', () => ({
	VscRemote: () => <div data-testid='vsc-remote' />,
	VscError: () => <div data-testid='vsc-error' />,
	VscWarning: () => <div data-testid='vsc-warning' />,
	VscBell: () => <div data-testid='vsc-bell' />,
	VscFeedback: () => <div data-testid='vsc-feedback' />,
	VscCheck: () => <div data-testid='vsc-check' />,
}));

jest.mock('react-icons/io', () => ({
	IoIosGitBranch: () => <div data-testid='io-git-branch' />,
}));

describe('Footer', () => {
	it('renders the footer with all elements', () => {
		render(<Footer />);

		expect(screen.getByTestId('vsc-remote')).toBeInTheDocument();
		expect(screen.getByTestId('vsc-error')).toBeInTheDocument();
		expect(screen.getByTestId('vsc-warning')).toBeInTheDocument();
		expect(screen.getByTestId('vsc-bell')).toBeInTheDocument();
		expect(screen.getByTestId('vsc-feedback')).toBeInTheDocument();
		expect(screen.getByTestId('vsc-check')).toBeInTheDocument();
		expect(screen.getByTestId('io-git-branch')).toBeInTheDocument();

		expect(screen.getByText('main')).toBeInTheDocument();
		expect(screen.getAllByText('0')).toHaveLength(2);
	});

	it('shows the formatter actually used by the project (Biome, not Prettier)', () => {
		render(<Footer />);

		expect(screen.getByText('Biome')).toBeInTheDocument();
		expect(screen.queryByText('Prettier')).not.toBeInTheDocument();
	});

	it('exposes the remote status as a single native button', () => {
		render(<Footer />);

		const button = screen.getByRole('button', { name: 'footer.remote' });
		expect(button.tagName).toBe('BUTTON');
		expect(button).not.toHaveAttribute('role');
	});

	it('links to the project repository, not the profile page', () => {
		render(<Footer />);

		const link = screen.getByRole('link', { name: 'footer.viewSource' });
		expect(link).toHaveAttribute('href', siteConfig.repoUrl);
		expect(link).toHaveAttribute('target', '_blank');
		expect(link).toHaveAttribute('rel', 'noopener noreferrer');
	});

	it('renders the errors and warnings status with accessible labels', () => {
		render(<Footer />);

		expect(screen.getByRole('status', { name: 'footer.problems' })).toBeInTheDocument();
		expect(screen.getByLabelText('footer.errors')).toHaveTextContent('0');
		expect(screen.getByLabelText('footer.warnings')).toHaveTextContent('0');
	});
});
