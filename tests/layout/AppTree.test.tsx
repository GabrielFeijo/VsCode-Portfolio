import { createTheme, ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createElement, SetStateAction } from 'react';
import AppTree from '../../src/app/layout/AppTree';
import { Page } from '../../src/domain/page';

const navigate = jest.fn();
const createFile = jest.fn();
const saveOrUpdateData = jest.fn();
const deleteFile = jest.fn();
let pathname = '/about-me';
let translate = (key: string) => key;

jest.mock('react-router-dom', () => ({
	useLocation: () => ({ pathname }),
	useNavigate: () => navigate,
}));

jest.mock('react-i18next', () => ({
	useTranslation: () => ({ t: (key: string) => translate(key) }),
}));

jest.mock('src/services/storageService', () => ({
	StorageService: {
		createFile: (name: string) => createFile(name),
		saveOrUpdateData: (page: Page) => saveOrUpdateData(page),
		deleteFile: (index: number) => deleteFile(index),
	},
}));

jest.mock('@mui/x-tree-view', () => ({
	SimpleTreeView: ({ children }: { children: React.ReactNode }) => (
		<div data-testid='tree-view'>{children}</div>
	),
	TreeItem: ({
		children,
		itemId,
		label,
		onClick,
		onContextMenu,
		slots,
	}: {
		children?: React.ReactNode;
		itemId: string;
		label: React.ReactNode;
		onClick?: React.MouseEventHandler<HTMLDivElement>;
		onContextMenu?: React.MouseEventHandler<HTMLDivElement>;
		slots?: { icon?: React.ElementType };
	}) => (
		<div
			data-testid={`tree-item-${itemId}`}
			onClick={onClick}
			onContextMenu={onContextMenu}
		>
			{slots?.icon ? createElement(slots.icon) : null}
			{label}
			{children}
		</div>
	),
}));

jest.mock('src/app/components/ContextMenu/ContextMenu', () => ({
	__esModule: true,
	default: ({
		contextMenu,
		handleOpenFile,
		handleOpenFileOnGithub,
		handleDelete,
		handleClose,
	}: {
		contextMenu: unknown;
		handleOpenFile: () => void;
		handleOpenFileOnGithub: () => void;
		handleDelete: () => void;
		handleClose: () => void;
	}) =>
		contextMenu ? (
			<div role='menu'>
				<button onClick={handleOpenFile}>Open file</button>
				<button onClick={handleOpenFileOnGithub}>Open on GitHub</button>
				<button onClick={handleDelete}>Delete file</button>
				<button onClick={handleClose}>Close menu</button>
			</div>
		) : null,
}));

const defaultPages: Page[] = [
	{ index: 0, name: 'about-me.html', route: 'about-me' },
	{ index: 1, name: 'projects.html', route: 'projects', isSaved: false },
];

function renderTree(options?: {
	pages?: Page[];
	language?: 'pt' | 'en';
	visiblePageIndexes?: number[];
	theme?: 'dark' | 'light';
}) {
	const pages = options?.pages || defaultPages;
	const visiblePageIndexes = options?.visiblePageIndexes || [0];
	const props = {
		pages,
		setPages: jest.fn((update: SetStateAction<Page[]>) =>
			typeof update === 'function' ? update(pages) : undefined
		),
		selectedIndex: 0,
		setSelectedIndex: jest.fn(),
		currentComponent: 'tree',
		setCurrentComponent: jest.fn(),
		visiblePageIndexes,
		setVisiblePageIndexes: jest.fn((update: SetStateAction<number[]>) =>
			typeof update === 'function' ? update(visiblePageIndexes) : undefined
		),
		language: options?.language || ('pt' as const),
	};

	const theme = createTheme({ palette: { mode: options?.theme || 'dark' } });
	const view = render(
		<ThemeProvider theme={theme}>
			<AppTree {...props} />
		</ThemeProvider>
	);
	return {
		...props,
		rerenderPages(nextPages: Page[]) {
			view.rerender(
				<ThemeProvider theme={theme}>
					<AppTree {...props} pages={nextPages} />
				</ThemeProvider>
			);
		},
	};
}

describe('AppTree', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		pathname = '/about-me';
		translate = (key) => key;
		createFile.mockReturnValue({
			index: 10,
			name: 'new-file.md',
			route: 'new-file.md',
			content: '',
			isSaved: true,
		});
	});

	it('selects the page represented by the current route', async () => {
		const props = renderTree();

		await waitFor(() => expect(props.setSelectedIndex).toHaveBeenCalledWith(0));
		expect(screen.getByText('projects.md')).toBeInTheDocument();
	});

	it('opens a page and adds a hidden tab to the visible list', () => {
		const props = renderTree({ visiblePageIndexes: [0] });

		fireEvent.click(screen.getByTestId('tree-item-1'));
		expect(props.setVisiblePageIndexes).toHaveBeenCalledWith([0, 1]);
		expect(props.setSelectedIndex).toHaveBeenCalledWith(1);
		expect(props.setCurrentComponent).toHaveBeenCalledWith('tree');
		expect(navigate).toHaveBeenCalledWith('/projects');
	});

	it('preserves an already visible tab and localizes navigation', () => {
		const props = renderTree({ language: 'en', visiblePageIndexes: [0, 1] });

		fireEvent.click(screen.getByTestId('tree-item-1'));
		expect(props.setVisiblePageIndexes).not.toHaveBeenCalled();
		expect(navigate).toHaveBeenCalledWith('/en/projects');
	});

	it('creates, persists and opens a normalized markdown file', () => {
		const props = renderTree();
		fireEvent.click(screen.getByRole('button', { name: 'sidebar.createFile' }));

		const input = screen.getByPlaceholderText('prompts.enter_filename');
		fireEvent.change(input, { target: { value: 'New File.md' } });
		expect(input).toHaveValue('new-file');
		fireEvent.keyDown(input, { key: 'Enter' });

		expect(createFile).toHaveBeenCalledWith('new-file.md');
		expect(saveOrUpdateData).toHaveBeenCalledWith(
			expect.objectContaining({ route: 'new-file.md' })
		);
		expect(props.setPages).toHaveBeenCalledWith([
			...defaultPages,
			expect.objectContaining({ index: 10 }),
		]);
		expect(navigate).toHaveBeenCalledWith('/new-file.md');
	});

	it('opens an existing custom file instead of duplicating it', () => {
		const existingPage: Page = {
			index: 20,
			name: 'existing.md',
			route: 'existing.md',
			content: 'saved',
		};
		const props = renderTree({ pages: [...defaultPages, existingPage] });
		fireEvent.click(screen.getByRole('button', { name: 'sidebar.createFile' }));
		const input = screen.getByPlaceholderText('prompts.enter_filename');
		fireEvent.change(input, { target: { value: 'existing' } });
		fireEvent.keyDown(input, { key: 'Enter' });

		expect(createFile).not.toHaveBeenCalled();
		expect(props.setSelectedIndex).toHaveBeenCalledWith(20);
		expect(navigate).toHaveBeenCalledWith('/existing.md');
	});

	it('cancels blank and explicit file creation', () => {
		renderTree();
		fireEvent.click(screen.getByRole('button', { name: 'sidebar.createFile' }));
		fireEvent.keyDown(screen.getByPlaceholderText('prompts.enter_filename'), {
			key: 'Enter',
		});
		expect(screen.queryByPlaceholderText('prompts.enter_filename')).not.toBeInTheDocument();

		fireEvent.click(screen.getByRole('button', { name: 'sidebar.createFile' }));
		fireEvent.keyDown(screen.getByPlaceholderText('prompts.enter_filename'), {
			key: 'Escape',
		});
		expect(screen.queryByPlaceholderText('prompts.enter_filename')).not.toBeInTheDocument();
	});

	it('supports context menu open, delete and GitHub actions', () => {
		const props = renderTree();
		const page = screen.getByTestId('tree-item-1');

		fireEvent.contextMenu(page, { clientX: 20, clientY: 30 });
		fireEvent.click(screen.getByRole('button', { name: 'Open file' }));
		expect(navigate).toHaveBeenCalledWith('/projects');

		fireEvent.contextMenu(page, { clientX: 20, clientY: 30 });
		fireEvent.click(screen.getByRole('button', { name: 'Delete file' }));
		expect(deleteFile).toHaveBeenCalledWith(1);
		expect(props.setPages).toHaveBeenCalledWith(expect.any(Function));
		expect(navigate).toHaveBeenCalledWith('/about-me');

		const open = jest.spyOn(window, 'open').mockImplementation(() => null);
		fireEvent.contextMenu(page, { clientX: 20, clientY: 30 });
		fireEvent.click(screen.getByRole('button', { name: 'Open on GitHub' }));
		expect(open).toHaveBeenCalledWith(
			expect.stringContaining('/public/pages/pt/projects.html'),
			'_blank',
			'noopener,noreferrer'
		);
		open.mockRestore();
	});

	it('closes the context menu without changing files', () => {
		renderTree();
		fireEvent.contextMenu(screen.getByTestId('tree-item-0'));
		fireEvent.click(screen.getByRole('button', { name: 'Close menu' }));

		expect(screen.queryByRole('menu')).not.toBeInTheDocument();
		expect(deleteFile).not.toHaveBeenCalled();
	});

	it('renders the light theme and exercises explorer toolbar actions', () => {
		pathname = '/missing';
		renderTree({ theme: 'light' });

		fireEvent.click(screen.getByRole('button', { name: 'sidebar.createFolder' }));
		fireEvent.click(screen.getByRole('button', { name: 'sidebar.refresh' }));
		expect(navigate).not.toHaveBeenCalled();

		fireEvent.click(screen.getByRole('button', { name: 'sidebar.createFile' }));
		fireEvent.change(screen.getByPlaceholderText('prompts.enter_filename'), {
			target: { value: 'Confirmed File' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'sidebar.confirm' }));
		expect(createFile).toHaveBeenCalledWith('confirmed-file.md');

		fireEvent.click(screen.getByRole('button', { name: 'sidebar.createFile' }));
		fireEvent.click(screen.getByRole('button', { name: 'sidebar.cancel' }));
		expect(screen.queryByPlaceholderText('prompts.enter_filename')).not.toBeInTheDocument();
	});

	it('toggles an open context menu from the same item', () => {
		renderTree();
		const page = screen.getByTestId('tree-item-0');

		fireEvent.contextMenu(page);
		expect(screen.getByRole('menu')).toBeInTheDocument();
		fireEvent.contextMenu(page);
		expect(screen.queryByRole('menu')).not.toBeInTheDocument();
	});

	it('keeps the context menu open when its page no longer exists', () => {
		const props = renderTree();
		fireEvent.contextMenu(screen.getByTestId('tree-item-1'));
		props.rerenderPages([defaultPages[0]]);

		fireEvent.click(screen.getByRole('button', { name: 'Open file' }));

		expect(screen.getByRole('menu')).toBeInTheDocument();
		expect(navigate).not.toHaveBeenCalled();

		fireEvent.click(screen.getByRole('button', { name: 'Close menu' }));
		props.rerenderPages(defaultPages);
		fireEvent.contextMenu(screen.getByTestId('tree-item-1'));
		props.rerenderPages([defaultPages[0]]);
		const open = jest.spyOn(window, 'open').mockImplementation(() => null);

		fireEvent.click(screen.getByRole('button', { name: 'Open on GitHub' }));

		expect(open).not.toHaveBeenCalled();
		expect(screen.getByRole('menu')).toBeInTheDocument();
		open.mockRestore();
	});

	it('uses accessible fallbacks when toolbar translations are missing', () => {
		translate = () => '';
		renderTree();

		expect(screen.getByRole('button', { name: 'Create new file' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Create new folder' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();

		fireEvent.click(screen.getByRole('button', { name: 'Create new file' }));
		expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
	});
});
