import { render, screen, waitFor } from '@testing-library/react';
import Home from 'src/app/pages/Home';

const has24HoursPassed = jest.fn();
const setCache = jest.fn();
const getResponse = jest.fn();

jest.mock('src/services/cacheService', () => ({
	CacheService: {
		has24HoursPassed: () => has24HoursPassed(),
		setCache: (value: unknown) => setCache(value),
	},
}));

jest.mock('src/services/api/home/HomeService', () => ({
	HomeService: {
		getResponse: () => getResponse(),
	},
}));

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

jest.mock('src/app/components/Loading/Loading', () => () => (
	<div role='status'>Loading</div>
));

describe('Home', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		has24HoursPassed.mockReturnValue(false);
		getResponse.mockResolvedValue({ connected: true });
	});

	it('renders localized content and skips a cached health check', async () => {
		const setSelectedIndex = jest.fn();
		render(<Home setSelectedIndex={setSelectedIndex} />);

		expect(screen.getByRole('heading', { name: 'Gabriel Feijó' })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
			'href',
			'https://github.com/GabrielFeijo'
		);
		expect(setSelectedIndex).toHaveBeenCalledWith(-1);
		await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
		expect(getResponse).not.toHaveBeenCalled();
	});

	it('refreshes and stores a successful health check', async () => {
		has24HoursPassed.mockReturnValue(true);
		render(<Home setSelectedIndex={jest.fn()} />);

		await waitFor(() => expect(getResponse).toHaveBeenCalledTimes(1));
		expect(setCache).toHaveBeenCalledWith({ lastFetch: expect.any(String) });
		await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
	});

	it('stops loading when the health check fails', async () => {
		has24HoursPassed.mockReturnValue(true);
		getResponse.mockResolvedValue(new Error('offline'));
		render(<Home setSelectedIndex={jest.fn()} />);

		await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
		expect(setCache).not.toHaveBeenCalled();
	});
});
