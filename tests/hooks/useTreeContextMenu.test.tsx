import { renderHook, act } from '@testing-library/react';
import { useTreeContextMenu } from '@/app/hooks/useTreeContextMenu';
import { Page } from '@/domain/page';

describe('useTreeContextMenu', () => {
	const initialPages: Page[] = [
		{ index: 0, name: 'about-me.md', route: 'about-me', content: 'About me' },
	];

	beforeEach(() => {
		jest.restoreAllMocks();
	});

	it('should initialize with contextMenu as null', () => {
		const setPages = jest.fn();
		const setVisiblePageIndexes = jest.fn();
		const setSelectedIndex = jest.fn();
		const navigate = jest.fn();
		const openFile = jest.fn();

		const { result } = renderHook(() =>
			useTreeContextMenu({
				pages: initialPages,
				setPages,
				setVisiblePageIndexes,
				setSelectedIndex,
				navigate,
				language: 'pt',
				openFile,
			})
		);

		expect(result.current.contextMenu).toBeNull();
	});

	it('should open and close context menu', () => {
		const setPages = jest.fn();
		const setVisiblePageIndexes = jest.fn();
		const setSelectedIndex = jest.fn();
		const navigate = jest.fn();
		const openFile = jest.fn();

		const { result } = renderHook(() =>
			useTreeContextMenu({
				pages: initialPages,
				setPages,
				setVisiblePageIndexes,
				setSelectedIndex,
				navigate,
				language: 'pt',
				openFile,
			})
		);

		act(() => {
			result.current.handleContextMenu(
				{ preventDefault: jest.fn(), clientX: 100, clientY: 200 } as unknown as React.MouseEvent,
				0
			);
		});

		expect(result.current.contextMenu).toEqual({
			mouseX: 98,
			mouseY: 196,
			pageIndex: 0,
		});

		act(() => {
			result.current.handleClose();
		});

		expect(result.current.contextMenu).toBeNull();
	});

	it('should handle open file from context menu', () => {
		const setPages = jest.fn();
		const setVisiblePageIndexes = jest.fn();
		const setSelectedIndex = jest.fn();
		const navigate = jest.fn();
		const openFile = jest.fn();

		const { result } = renderHook(() =>
			useTreeContextMenu({
				pages: initialPages,
				setPages,
				setVisiblePageIndexes,
				setSelectedIndex,
				navigate,
				language: 'pt',
				openFile,
			})
		);

		act(() => {
			result.current.handleContextMenu(
				{ preventDefault: jest.fn(), clientX: 100, clientY: 200 } as unknown as React.MouseEvent,
				0
			);
		});

		act(() => {
			result.current.handleOpenFile();
		});

		expect(openFile).toHaveBeenCalledWith(initialPages[0]);
		expect(result.current.contextMenu).toBeNull();
	});

	it('should do nothing on open, delete, or github if contextMenu is null', () => {
		const setPages = jest.fn();
		const setVisiblePageIndexes = jest.fn();
		const setSelectedIndex = jest.fn();
		const navigate = jest.fn();
		const openFile = jest.fn();

		const { result } = renderHook(() =>
			useTreeContextMenu({
				pages: initialPages,
				setPages,
				setVisiblePageIndexes,
				setSelectedIndex,
				navigate,
				language: 'pt',
				openFile,
			})
		);

		act(() => {
			result.current.handleOpenFile();
			result.current.handleDelete();
			result.current.handleOpenFileOnGithub();
		});

		expect(openFile).not.toHaveBeenCalled();
		expect(setPages).not.toHaveBeenCalled();
	});

	it('should do nothing on open or github if page does not exist', () => {
		const setPages = jest.fn();
		const setVisiblePageIndexes = jest.fn();
		const setSelectedIndex = jest.fn();
		const navigate = jest.fn();
		const openFile = jest.fn();

		const { result } = renderHook(() =>
			useTreeContextMenu({
				pages: initialPages,
				setPages,
				setVisiblePageIndexes,
				setSelectedIndex,
				navigate,
				language: 'pt',
				openFile,
			})
		);

		act(() => {
			result.current.handleContextMenu(
				{ preventDefault: jest.fn(), clientX: 100, clientY: 200 } as unknown as React.MouseEvent,
				999
			);
		});

		act(() => {
			result.current.handleOpenFile();
			result.current.handleOpenFileOnGithub();
		});

		expect(openFile).not.toHaveBeenCalled();
	});

	it('should open page on github when page exists', () => {
		const setPages = jest.fn();
		const setVisiblePageIndexes = jest.fn();
		const setSelectedIndex = jest.fn();
		const navigate = jest.fn();
		const openFile = jest.fn();
		const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation(() => null);

		const { result } = renderHook(() =>
			useTreeContextMenu({
				pages: initialPages,
				setPages,
				setVisiblePageIndexes,
				setSelectedIndex,
				navigate,
				language: 'pt',
				openFile,
			})
		);

		act(() => {
			result.current.handleContextMenu(
				{ preventDefault: jest.fn(), clientX: 100, clientY: 200 } as unknown as React.MouseEvent,
				0
			);
		});

		act(() => {
			result.current.handleOpenFileOnGithub();
		});

		expect(windowOpenSpy).toHaveBeenCalledWith(
			expect.stringContaining('about-me.md'),
			'_blank',
			'noopener,noreferrer'
		);
		expect(result.current.contextMenu).toBeNull();
	});

	it('should handle delete from context menu and filter pages', () => {
		let currentPages = [...initialPages];
		const setPages = jest.fn((updater) => {
			if (typeof updater === 'function') {
				currentPages = updater(currentPages);
			}
		});
		const setVisiblePageIndexes = jest.fn((updater) => {
			if (typeof updater === 'function') {
				updater([0]);
			}
		});
		const setSelectedIndex = jest.fn();
		const navigate = jest.fn();
		const openFile = jest.fn();

		const { result } = renderHook(() =>
			useTreeContextMenu({
				pages: initialPages,
				setPages,
				setVisiblePageIndexes,
				setSelectedIndex,
				navigate,
				language: 'pt',
				openFile,
			})
		);

		act(() => {
			result.current.handleContextMenu(
				{ preventDefault: jest.fn(), clientX: 100, clientY: 200 } as unknown as React.MouseEvent,
				0
			);
		});

		act(() => {
			result.current.handleDelete();
		});

		expect(setPages).toHaveBeenCalled();
		expect(setVisiblePageIndexes).toHaveBeenCalled();
		expect(setSelectedIndex).toHaveBeenCalledWith(0);
		expect(navigate).toHaveBeenCalled();
		expect(result.current.contextMenu).toBeNull();
	});
});
