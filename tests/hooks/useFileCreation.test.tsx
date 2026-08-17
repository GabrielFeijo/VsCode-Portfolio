import { renderHook, act } from '@testing-library/react';
import { useFileCreation } from '@/app/hooks/useFileCreation';
import { Page } from '@/domain/page';

describe('useFileCreation', () => {
	const initialPages: Page[] = [
		{ index: 0, name: 'about-me.md', route: 'about-me', content: 'About me' },
	];

	it('should initialize with isCreatingFile as false and newFileName empty', () => {
		const setPages = jest.fn();
		const openFile = jest.fn();

		const { result } = renderHook(() =>
			useFileCreation({ pages: initialPages, setPages, openFile })
		);

		expect(result.current.isCreatingFile).toBe(false);
		expect(result.current.newFileName).toBe('');
	});

	it('should handle start and cancel file creation', () => {
		const setPages = jest.fn();
		const openFile = jest.fn();

		const { result } = renderHook(() =>
			useFileCreation({ pages: initialPages, setPages, openFile })
		);

		act(() => {
			result.current.handleCreateFile({
				stopPropagation: jest.fn(),
			} as unknown as React.MouseEvent);
		});

		expect(result.current.isCreatingFile).toBe(true);

		act(() => {
			result.current.setNewFileName('test-file');
		});

		act(() => {
			result.current.handleCancelCreateFile();
		});

		expect(result.current.isCreatingFile).toBe(false);
		expect(result.current.newFileName).toBe('');
	});

	it('should create new file on confirm', () => {
		const setPages = jest.fn();
		const openFile = jest.fn();

		const { result } = renderHook(() =>
			useFileCreation({ pages: initialPages, setPages, openFile })
		);

		act(() => {
			result.current.setNewFileName('notes.md');
		});

		act(() => {
			result.current.handleConfirmCreateFile();
		});

		expect(setPages).toHaveBeenCalled();
		expect(openFile).toHaveBeenCalled();
		expect(result.current.isCreatingFile).toBe(false);
	});

	it('should open existing file if name already exists', () => {
		const setPages = jest.fn();
		const openFile = jest.fn();

		const { result } = renderHook(() =>
			useFileCreation({ pages: initialPages, setPages, openFile })
		);

		act(() => {
			result.current.setNewFileName('about-me.md');
		});

		act(() => {
			result.current.handleConfirmCreateFile();
		});

		expect(openFile).toHaveBeenCalledWith(initialPages[0]);
		expect(setPages).not.toHaveBeenCalled();
	});

	it('should handle Enter and Escape keydowns', () => {
		const setPages = jest.fn();
		const openFile = jest.fn();

		const { result } = renderHook(() =>
			useFileCreation({ pages: initialPages, setPages, openFile })
		);

		act(() => {
			result.current.handleKeyDown({
				key: 'Escape',
				preventDefault: jest.fn(),
				stopPropagation: jest.fn(),
			} as unknown as React.KeyboardEvent);
		});

		expect(result.current.isCreatingFile).toBe(false);

		act(() => {
			result.current.setNewFileName('custom');
		});

		act(() => {
			result.current.handleKeyDown({
				key: 'Enter',
				preventDefault: jest.fn(),
				stopPropagation: jest.fn(),
			} as unknown as React.KeyboardEvent);
		});

		expect(openFile).toHaveBeenCalled();
	});
});
