import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MDContainer from '../../src/app/components/MDContainer';
import { StorageService } from '../../src/services/storageService';
import { PAGE_FILES } from '../mocks/pageContentGlob';

jest.mock('../../src/app/components/MarkdownRenderer', () => ({
	__esModule: true,
	default: ({ content, allowRawHtml }: any) => (
		<div
			data-testid='markdown-renderer'
			data-raw-html={Boolean(allowRawHtml)}
		>
			{content}
		</div>
	),
}));

jest.mock('../../src/app/components/MarkdownEditor', () => ({
	__esModule: true,
	default: ({ value, onChange }: any) => (
		<textarea
			aria-label='Markdown editor'
			value={value}
			onChange={(event) => onChange(event.target.value)}
		/>
	),
}));

describe('MDContainer', () => {
	beforeEach(() => {
		jest.restoreAllMocks();
		for (const key of Object.keys(PAGE_FILES)) {
			delete PAGE_FILES[key];
		}
	});

	it('loads and renders content from bundled static pages without network fetch', async () => {
		PAGE_FILES['../pages/pt/sobre-mim.html'] = '# Bundled static content';
		global.fetch = jest.fn();

		render(
			<MemoryRouter initialEntries={['/about-me']}>
				<MDContainer
					path='/pages/pt/sobre-mim.html'
					setPages={jest.fn()}
				/>
			</MemoryRouter>
		);

		await waitFor(() =>
			expect(screen.getByTestId('markdown-renderer')).toHaveTextContent(
				'# Bundled static content'
			)
		);
		expect(global.fetch).not.toHaveBeenCalled();
	});

	it('loads and renders content from a static page', async () => {
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			text: jest.fn().mockResolvedValue('# Loaded content'),
		});

		render(
			<MemoryRouter initialEntries={['/about-me']}>
				<MDContainer
					path='/page.html'
					setPages={jest.fn()}
				/>
			</MemoryRouter>
		);

		await waitFor(() =>
			expect(screen.getByTestId('markdown-renderer')).toHaveTextContent(
				'# Loaded content'
			)
		);
		expect(screen.getByTestId('markdown-renderer')).toHaveAttribute(
			'data-raw-html',
			'true'
		);
		expect(global.fetch).toHaveBeenCalledWith(
			'/page.html',
			expect.objectContaining({ cache: 'force-cache' })
		);
	});

	it('shows fallback content when a static page cannot be loaded', async () => {
		global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 });

		render(
			<MemoryRouter initialEntries={['/missing']}>
				<MDContainer
					path='/missing.html'
					setPages={jest.fn()}
				/>
			</MemoryRouter>
		);

		await waitFor(() =>
			expect(screen.getByTestId('markdown-renderer')).toHaveTextContent(
				'Failed to load content.'
			)
		);
	});

	it('loads static content when page metadata has no editable content', async () => {
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			text: jest.fn().mockResolvedValue('# Static page'),
		});
		const page = {
			index: 10,
			name: 'about.md',
			route: 'about-me',
		};

		render(
			<MemoryRouter>
				<MDContainer
					path='/about.md'
					page={page}
					setPages={jest.fn()}
				/>
			</MemoryRouter>
		);

		await waitFor(() =>
			expect(screen.getByTestId('markdown-renderer')).toHaveTextContent(
				'# Static page'
			)
		);
		expect(screen.queryByLabelText('Markdown editor')).not.toBeInTheDocument();
	});

	it('loads content from storage if present for non-editable page metadata', async () => {
		jest.spyOn(StorageService, 'getData').mockReturnValue([
			{ index: 10, name: 'about.md', route: 'about-me', content: '# From storage' },
		]);
		global.fetch = jest.fn();

		const page = {
			index: 10,
			name: 'about.html',
			route: 'about-me',
		};

		render(
			<MemoryRouter>
				<MDContainer
					path='/about.html'
					page={page}
					setPages={jest.fn()}
				/>
			</MemoryRouter>
		);

		expect(screen.getByTestId('markdown-renderer')).toHaveTextContent(
			'# From storage'
		);
		expect(global.fetch).not.toHaveBeenCalled();
	});

	it('matches stored page by exact name, html extension, or base name', () => {
		jest.spyOn(StorageService, 'getData').mockReturnValue([
			{ index: 99, name: 'skills.html', route: 'skills', content: '# Skills html' },
		]);

		const page1 = { index: 1, name: 'skills.md', route: 'skills' };
		const { unmount } = render(
			<MemoryRouter>
				<MDContainer path='/skills.md' page={page1} setPages={jest.fn()} />
			</MemoryRouter>
		);
		expect(screen.getByTestId('markdown-renderer')).toHaveTextContent('# Skills html');
		unmount();

		jest.spyOn(StorageService, 'getData').mockReturnValue([
			{ index: 99, name: 'projects', route: 'projects', content: '# Projects base' },
		]);
		const page2 = { index: 2, name: 'projects.html', route: 'projects' };
		const { unmount: unmount2 } = render(
			<MemoryRouter>
				<MDContainer path='/projects.html' page={page2} setPages={jest.fn()} />
			</MemoryRouter>
		);
		expect(screen.getByTestId('markdown-renderer')).toHaveTextContent('# Projects base');
		unmount2();
	});

	it('loads content from page.content when page is a default page', async () => {
		jest.spyOn(StorageService, 'getData').mockReturnValue([]);
		global.fetch = jest.fn();

		const page = {
			index: 0,
			name: 'sobre-mim.html',
			route: 'about-me',
			content: '<section><h1>Live content</h1></section>',
		};

		render(
			<MemoryRouter>
				<MDContainer
					path='/pages/pt/sobre-mim.html'
					page={page}
					setPages={jest.fn()}
				/>
			</MemoryRouter>
		);

		expect(screen.getByTestId('markdown-renderer')).toHaveTextContent(
			'Live content'
		);
		expect(screen.queryByLabelText('Markdown editor')).not.toBeInTheDocument();
		expect(global.fetch).not.toHaveBeenCalled();
	});

	it('reloads content on storage window event and aborts active controller', async () => {
		let storageData: any[] = [];
		jest.spyOn(StorageService, 'getData').mockImplementation(() => storageData);
		global.fetch = jest.fn().mockImplementation(() => new Promise(() => undefined));

		const page = {
			index: 10,
			name: 'about.md',
			route: 'about-me',
		};

		render(
			<MemoryRouter>
				<MDContainer
					path='/about.md'
					page={page}
					setPages={jest.fn()}
				/>
			</MemoryRouter>
		);

		act(() => {
			window.dispatchEvent(new Event('storage'));
		});

		expect(global.fetch).toHaveBeenCalled();
	});

	it('ignores abort errors while loading static content', async () => {
		global.fetch = jest
			.fn()
			.mockRejectedValue(new DOMException('Request aborted', 'AbortError'));

		render(
			<MemoryRouter>
				<MDContainer
					path='/cancelled.md'
					setPages={jest.fn()}
				/>
			</MemoryRouter>
		);

		await waitFor(() => expect(global.fetch).toHaveBeenCalled());
		expect(screen.getByTestId('markdown-renderer')).not.toHaveTextContent(
			'Failed to load content.'
		);
	});

	it('aborts an active static request on unmount', () => {
		global.fetch = jest.fn(() => new Promise(() => undefined));
		const abort = jest.spyOn(AbortController.prototype, 'abort');
		const { unmount } = render(
			<MemoryRouter>
				<MDContainer
					path='/pending.md'
					setPages={jest.fn()}
				/>
			</MemoryRouter>
		);

		unmount();

		expect(abort).toHaveBeenCalledTimes(1);
	});

	it('opens editable pages with empty content when content is undefined', async () => {
		global.fetch = jest.fn();
		const page = {
			index: 15,
			name: 'empty.md',
			route: 'empty.md',
			content: undefined,
		};

		render(
			<MemoryRouter>
				<MDContainer
					path='/unused'
					page={page}
					setPages={jest.fn()}
				/>
			</MemoryRouter>
		);

		expect(await screen.findByLabelText('Markdown editor')).toHaveValue('');
		expect(global.fetch).not.toHaveBeenCalled();
	});

	it('opens editable pages with preset content and handles global save shortcut when page is undefined', async () => {
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			text: jest.fn().mockResolvedValue('# Content'),
		});
		render(
			<MemoryRouter>
				<MDContainer
					path='/static.html'
					setPages={jest.fn()}
				/>
			</MemoryRouter>
		);

		await waitFor(() =>
			expect(screen.getByTestId('markdown-renderer')).toHaveTextContent(
				'# Content'
			)
		);

		fireEvent.keyDown(window, { key: 's', ctrlKey: true });
	});

	it('edits and persists a custom page without fetching static content', async () => {
		global.fetch = jest.fn();
		const savePage = jest
			.spyOn(StorageService, 'saveOrUpdateData')
			.mockImplementation(() => undefined);
		const page = {
			index: 20,
			name: 'notes.md',
			route: 'notes.md',
			content: '# Notes',
			isSaved: true,
		};
		const otherPage = {
			index: 21,
			name: 'other.md',
			route: 'other.md',
			content: '# Other',
			isSaved: true,
		};
		let pages = [page, otherPage];
		const setPages = jest.fn((update) => {
			pages = typeof update === 'function' ? update(pages) : update;
		});

		render(
			<MemoryRouter initialEntries={['/notes.md']}>
				<MDContainer
					path='/unused'
					page={page}
					setPages={setPages}
				/>
			</MemoryRouter>
		);

		fireEvent.change(await screen.findByLabelText('Markdown editor'), {
			target: { value: '# Updated notes' },
		});
		expect(setPages).toHaveBeenCalled();
		expect(pages[0]).toEqual(
			expect.objectContaining({ content: '# Updated notes', isSaved: false })
		);
		expect(pages[1]).toBe(otherPage);

		fireEvent.keyDown(window, { key: 's' });
		fireEvent.keyDown(window, { key: 'x', ctrlKey: true });
		expect(savePage).not.toHaveBeenCalled();

		fireEvent.keyDown(window, { key: 's', ctrlKey: true });
		expect(savePage).toHaveBeenCalledWith(
			expect.objectContaining({
				index: 20,
				content: '# Updated notes',
				isSaved: true,
			})
		);
		expect(pages[0]).toEqual(
			expect.objectContaining({ content: '# Updated notes', isSaved: true })
		);
		expect(pages[1]).toBe(otherPage);
		expect(global.fetch).not.toHaveBeenCalled();
	});
});
