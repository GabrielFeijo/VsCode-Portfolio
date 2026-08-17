import { render, screen } from '@testing-library/react';
import MarkdownRenderer, {
	getAllowedEmbedSource,
} from '../../src/app/components/MarkdownRenderer';
import { STYLE_FILES } from '../mocks/styleContentGlob';

let mockIframeSource = 'https://www.youtube.com/embed/video-id';
let mockTheme = 'dark';
let mockStylesheetHref =
	'https://cdn.jsdelivr.net/gh/devicons/devicon@2.17.0/devicon.min.css';
let mockStylesheetRel = 'stylesheet';

jest.mock('react-markdown', () => {
	const React = jest.requireActual('react');

	return {
		__esModule: true,
		default: ({ components, rehypePlugins }: { components: Record<string, React.ElementType>; rehypePlugins: unknown[] }) =>
			React.createElement(
				'div',
				{
					'data-testid': 'markdown-root',
					'data-raw-html': rehypePlugins.length > 0,
					'data-strips-title': (
						(rehypePlugins[1] as [unknown, { strip?: string[] }])?.[1]?.strip || []
					).includes('title'),
				},
				React.createElement(components.h1, null, 'Title'),
				React.createElement(components.h2, null, 'Subtitle'),
				React.createElement(components.a, { href: 'https://example.com' }, 'Portfolio'),
				React.createElement(components.code, { className: 'language-typescript' }, 'const value = 1;\n'),
				React.createElement(components.code, null, 'plain code'),
				React.createElement(components.img, { src: '/profile.webp', alt: 'Profile', className: 'profile' }),
				React.createElement(components.img, { src: '/project.png', alt: 'Project' }),
				React.createElement(components.img, { src: '../../gabrielfeijo.webp', alt: 'Relative' }),
				React.createElement(components.img, { src: undefined, alt: 'NoSrc' }),
				React.createElement(components.iframe, { src: mockIframeSource }),
				React.createElement(components.link, {
					href: mockStylesheetHref,
					rel: mockStylesheetRel,
				}),
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
jest.mock('rehype-sanitize', () => ({
	__esModule: true,
	default: jest.fn(),
	defaultSchema: {
		attributes: { '*': [] },
		strip: ['script'],
		tagNames: [],
	},
}));
jest.mock('remark-breaks', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('remark-gfm', () => ({ __esModule: true, default: jest.fn() }));

jest.mock('src/contexts/ThemeContext', () => ({
	useTheme: () => ({ theme: mockTheme, toggleTheme: jest.fn() }),
}));

describe('MarkdownRenderer', () => {
	beforeEach(() => {
		for (const key of Object.keys(STYLE_FILES)) {
			delete STYLE_FILES[key];
		}
		mockIframeSource = 'https://www.youtube.com/embed/video-id';
		mockTheme = 'dark';
		mockStylesheetHref =
			'https://cdn.jsdelivr.net/gh/devicons/devicon@2.17.0/devicon.min.css';
		mockStylesheetRel = 'stylesheet';
	});

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

	it('renders code blocks in the light theme', () => {
		mockTheme = 'light';

		const { container } = render(<MarkdownRenderer content='code' />);

		expect(container.querySelector('code')).toHaveTextContent('const value = 1;');
	});

	it('enhances raw images and iframes when HTML is allowed', () => {
		render(<MarkdownRenderer allowRawHtml content='raw content' />);

		expect(screen.getByRole('img', { name: 'Profile' })).toHaveAttribute('loading', 'eager');
		expect(screen.getByRole('img', { name: 'Project' })).toHaveAttribute('loading', 'lazy');
		const iframe = screen.getByTitle('Embedded content');
		expect(iframe).toHaveAttribute('loading', 'lazy');
		expect(iframe).toHaveAttribute(
			'sandbox',
			'allow-scripts allow-same-origin allow-presentation'
		);
		expect(iframe).toHaveAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
		expect(screen.getByTestId('markdown-root')).toHaveAttribute('data-raw-html', 'true');
		expect(screen.getByTestId('markdown-root')).toHaveAttribute(
			'data-strips-title',
			'true'
		);
	});

	it.each([
		undefined,
		'not-a-url',
		'https://example.com/embed/video-id',
		'https://www.youtube.com/watch?v=video-id',
	])('blocks an unsafe iframe source: %s', (source) => {
		mockIframeSource = source as string;

		render(<MarkdownRenderer allowRawHtml content='raw content' />);

		expect(screen.queryByTitle('Embedded content')).not.toBeInTheDocument();
	});

	it('allows privacy-enhanced YouTube embeds', () => {
		expect(
			getAllowedEmbedSource('https://www.youtube-nocookie.com/embed/video-id')
		).toBe('https://www.youtube-nocookie.com/embed/video-id');
	});

	it('loads the pinned Devicon stylesheet with integrity protection', () => {
		const { container } = render(
			<MarkdownRenderer allowRawHtml content='raw content' />
		);

		const stylesheet = container.querySelector('link[rel="stylesheet"]');
		expect(stylesheet).toHaveAttribute('href', mockStylesheetHref);
		expect(stylesheet).toHaveAttribute('integrity', expect.stringMatching(/^sha384-/));
		expect(stylesheet).toHaveAttribute('crossorigin', 'anonymous');
	});

	it.each([
		['https://example.com/styles.css', 'stylesheet'],
		['', 'stylesheet'],
		['https://fonts.googleapis.com/icon?family=Material+Icons', 'preload'],
	])('blocks a stylesheet outside the allowlist', (href, rel) => {
		mockStylesheetHref = href;
		mockStylesheetRel = rel;

		const { container } = render(
			<MarkdownRenderer allowRawHtml content='raw content' />
		);

		expect(container.querySelector('link')).not.toBeInTheDocument();
	});

	it('allows the Material Symbols stylesheet without a fixed integrity hash', () => {
		mockStylesheetHref =
			'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0';

		const { container } = render(
			<MarkdownRenderer allowRawHtml content='raw content' />
		);

		const stylesheet = container.querySelector('link');
		expect(stylesheet).toHaveAttribute('href', mockStylesheetHref);
		expect(stylesheet).not.toHaveAttribute('integrity');
	});

	it('allows stylesheets from the local page styles directory', () => {
		mockStylesheetHref = '../../styles/projects.css';

		const { container } = render(
			<MarkdownRenderer allowRawHtml content='raw content' />
		);

		const stylesheet = container.querySelector('link');
		expect(stylesheet).toHaveAttribute('href', '../../styles/projects.css');
		expect(stylesheet).not.toHaveAttribute('crossorigin');
	});

	it('inlines local stylesheets when css content is available', () => {
		STYLE_FILES['../styles/projects.css'] = '.line { height: 35px; }';
		mockStylesheetHref = '../../styles/projects.css';

		const { container } = render(
			<MarkdownRenderer allowRawHtml content='raw content' />
		);

		const styleTag = container.querySelector('style[data-stylesheet="../../styles/projects.css"]');
		expect(styleTag).toBeInTheDocument();
		expect(styleTag).toHaveTextContent('.line { height: 35px; }');
	});

	it('does not interpret raw HTML by default', () => {
		render(<MarkdownRenderer content='content' />);

		expect(screen.getByTestId('markdown-root')).toHaveAttribute('data-raw-html', 'false');
	});
});
