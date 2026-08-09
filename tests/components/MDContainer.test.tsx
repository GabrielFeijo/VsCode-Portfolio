import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MDContainer from '../../src/app/components/MDContainer';
import { StorageService } from '../../src/services/storageService';

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
		let pages = [page];
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
		expect(global.fetch).not.toHaveBeenCalled();
	});
});
