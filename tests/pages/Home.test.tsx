import { render, screen } from '@testing-library/react';
import Home from '../../src/app/pages/Home';

jest.mock('react-router-dom', () => ({
	useLocation: () => ({ pathname: '/' }),
}));

jest.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => {
			const translations: Record<string, string> = {
				'header.title': 'Gabriel Feijó',
				'header.subtitle': 'Building useful software',
				'contact.github.title': 'GitHub',
				'contact.github.href': 'https://github.com/GabrielFeijo',
				'contact.linkedin.title': 'LinkedIn',
				'contact.linkedin.href': 'https://linkedin.com/in/gabriel-feijo',
				'contact.email.title': 'Email',
				'contact.email.href': 'mailto:test@example.com',
			};
			return translations[key] || key;
		},
	}),
}));

describe('Home', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders localized content and sets selected index to -1', () => {
		const setSelectedIndex = jest.fn();
		render(<Home setSelectedIndex={setSelectedIndex} />);

		expect(screen.getByRole('heading', { name: 'Gabriel Feijó' })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
			'href',
			'https://github.com/GabrielFeijo',
		);
		expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
			'href',
			'https://linkedin.com/in/gabriel-feijo',
		);
		expect(screen.getByRole('link', { name: 'Email' })).toHaveAttribute(
			'href',
			'mailto:test@example.com',
		);
		expect(setSelectedIndex).toHaveBeenCalledWith(-1);
	});
});
