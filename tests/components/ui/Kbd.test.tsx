import { render, screen } from '@testing-library/react';
import Kbd from '../../../src/app/components/ui/Kbd';

describe('Kbd', () => {
	it('renders each key as a separate badge', () => {
		render(<Kbd keys={['Ctrl', 'J']} />);

		expect(screen.getByText('Ctrl')).toBeInTheDocument();
		expect(screen.getByText('J')).toBeInTheDocument();
	});

	it('exposes an accessible group label', () => {
		render(<Kbd keys={['Ctrl', 'Shift', 'P']} />);

		expect(screen.getByRole('group', { name: 'Ctrl + Shift + P' })).toBeInTheDocument();
	});
});
