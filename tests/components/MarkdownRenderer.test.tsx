import { render, screen } from '@testing-library/react';
import MarkdownRenderer from '../../src/app/components/MarkdownRenderer';

jest.mock('react-markdown', () => {
	const React = jest.requireActual('react');

	return {
		__esModule: true,
		default: ({ components, rehypePlugins }: { components: Record<string, React.ElementType>; rehypePlugins: unknown[] }) =>
			React.createElement(
				'div',
				{ 'data-testid': 'markdown-root', 'data-raw-html': rehypePlugins.length > 0 },
				React.createElement(components.h1, null, 'Title'),
				React.createElement(components.h2, null, 'Subtitle'),
				React.createElement(components.a, { href: 'https://example.com' }, 'Portfolio'),
				React.createElement(components.code, { className: 'language-typescript' }, 'const value = 1;\n'),
				React.createElement(components.code, null, 'plain code'),
				React.createElement(components.img, { src: '/profile.webp', alt: 'Profile', className: 'profile' }),
				React.createElement(components.img, { src: '/project.png', alt: 'Project' }),
				React.createElement(components.iframe, { src: 'https://example.com/embed' }),
				React.createElement(
					components.table,
					null,
					React.createElement(
						components.tbody,
						null,
						React.createElement(
							components.tr,
							null,
							React.createElement(components.th, null, 'Header'),
							React.createElement(components.td, null, 'Cell')
						)
					)
				)
			),
	};
});

jest.mock('rehype-raw', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('remark-breaks', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('remark-gfm', () => ({ __esModule: true, default: jest.fn() }));

jest.mock('src/contexts/ThemeContext', () => ({
	useTheme: () => ({ theme: 'dark', toggleTheme: jest.fn() }),
}));

describe('MarkdownRenderer', () => {
	it('renders markdown structure and safe external links', () => {
		render(<MarkdownRenderer content='# Title' />);

		expect(screen.getByRole('heading', { level: 1, name: 'Title' })).toBeInTheDocument();
		expect(screen.getByRole('heading', { level: 2, name: 'Subtitle' })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Portfolio' })).toHaveAttribute(
			'rel',
			'noopener noreferrer'
		);
		expect(screen.getByRole('table', { name: 'Data table' })).toBeInTheDocument();
	});

	it('renders code blocks using the detected language', () => {
		const { container } = render(<MarkdownRenderer content='code' />);

		expect(container.querySelector('code')).toHaveClass('language-typescript');
		expect(container.querySelector('code')).toHaveTextContent('const value = 1;');
	});

	it('uses markdown as the default code language', () => {
		const { container } = render(<MarkdownRenderer content='plain code' />);

		expect(container.querySelectorAll('code')[1]).toHaveClass('language-md');
	});

	it('enhances raw images and iframes when HTML is allowed', () => {
		render(<MarkdownRenderer allowRawHtml content='raw content' />);

		expect(screen.getByRole('img', { name: 'Profile' })).toHaveAttribute('loading', 'eager');
		expect(screen.getByRole('img', { name: 'Project' })).toHaveAttribute('loading', 'lazy');
		expect(screen.getByTitle('Embedded content')).toHaveAttribute('loading', 'lazy');
		expect(screen.getByTestId('markdown-root')).toHaveAttribute('data-raw-html', 'true');
	});

	it('does not interpret raw HTML by default', () => {
		render(<MarkdownRenderer content='content' />);

		expect(screen.getByTestId('markdown-root')).toHaveAttribute('data-raw-html', 'false');
	});
});
