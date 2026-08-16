import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import NanoEditor, { syncPageStorage } from '../../../src/app/components/Terminal/terminal/NanoEditor';
import { StorageService } from '../../../src/services/storageService';
import { VirtualDirectory } from '../../../src/app/components/Terminal/terminal/types';

jest.mock('../../../src/services/storageService', () => ({
	StorageService: {
		getData: jest.fn(),
		saveOrUpdateData: jest.fn(),
		createFile: jest.fn(),
	},
}));

describe('NanoEditor', () => {
	const defaultFs: VirtualDirectory = {
		'/home/gabriel': [
			{ name: 'test.md', type: 'file', content: ['initial line 1', 'initial line 2'] },
		],
	};

	beforeEach(() => {
		jest.clearAllMocks();
		(StorageService.getData as jest.Mock).mockReturnValue([]);
		(StorageService.createFile as jest.Mock).mockImplementation((name, content) => ({
			index: 123,
			name,
			route: name,
			content,
			isFolder: false,
		}));
	});

	it('renders nano header, line numbers and initial content', () => {
		const onClose = jest.fn();
		const setFs = jest.fn();

		render(
			<NanoEditor
				fileName="test.md"
				filePath="/home/gabriel/test.md"
				initialContent={'line 1\nline 2'}
				cwd="/home/gabriel"
				fs={defaultFs}
				setFs={setFs}
				onClose={onClose}
				isDark={true}
			/>,
		);

		expect(screen.getByText('GNU nano 7.2')).toBeInTheDocument();
		expect(screen.getByText('File: test.md')).toBeInTheDocument();
		expect(screen.getByRole('textbox')).toHaveValue('line 1\nline 2');
	});

	it('updates content on change and saves with Ctrl+O', () => {
		const onClose = jest.fn();
		const setFs = jest.fn();

		render(
			<NanoEditor
				fileName="test.md"
				filePath="/home/gabriel/test.md"
				initialContent="line 1"
				cwd="/home/gabriel"
				fs={defaultFs}
				setFs={setFs}
				onClose={onClose}
				isDark={true}
			/>,
		);

		const textarea = screen.getByRole('textbox');
		fireEvent.change(textarea, { target: { value: 'line 1\nnew line 2' } });

		expect(screen.getByText('[Modified]')).toBeInTheDocument();

		fireEvent.keyDown(textarea, { key: 'o', ctrlKey: true });

		expect(setFs).toHaveBeenCalled();
		expect(StorageService.saveOrUpdateData).toHaveBeenCalled();
		expect(screen.getByText(/Wrote 2 lines to test\.md/)).toBeInTheDocument();
	});

	it('saves with Ctrl+S shortcut', () => {
		const onClose = jest.fn();
		const setFs = jest.fn();

		render(
			<NanoEditor
				fileName="test.md"
				filePath="/home/gabriel/test.md"
				initialContent="hello"
				cwd="/home/gabriel"
				fs={defaultFs}
				setFs={setFs}
				onClose={onClose}
				isDark={false}
			/>,
		);

		const textarea = screen.getByRole('textbox');
		fireEvent.keyDown(textarea, { key: 's', ctrlKey: true });
		expect(setFs).toHaveBeenCalled();
	});

	it('exits immediately on Ctrl+X if unmodified', () => {
		const onClose = jest.fn();
		const setFs = jest.fn();

		render(
			<NanoEditor
				fileName="test.md"
				filePath="/home/gabriel/test.md"
				initialContent="hello"
				cwd="/home/gabriel"
				fs={defaultFs}
				setFs={setFs}
				onClose={onClose}
				isDark={true}
			/>,
		);

		const textarea = screen.getByRole('textbox');
		fireEvent.keyDown(textarea, { key: 'x', ctrlKey: true });
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('prompts to save on Ctrl+X if modified, and handles Y/N/Ctrl+C', () => {
		const onClose = jest.fn();
		const setFs = jest.fn();

		const { unmount } = render(
			<NanoEditor
				fileName="test.md"
				filePath="/home/gabriel/test.md"
				initialContent="hello"
				cwd="/home/gabriel"
				fs={defaultFs}
				setFs={setFs}
				onClose={onClose}
				isDark={true}
			/>,
		);

		const textarea = screen.getByRole('textbox');
		fireEvent.change(textarea, { target: { value: 'hello modified' } });

		fireEvent.keyDown(textarea, { key: 'x', ctrlKey: true });
		expect(screen.getByText('Save modified buffer? (Y/N/Ctrl+C)')).toBeInTheDocument();

		fireEvent.keyDown(textarea, { key: 'c', ctrlKey: true });
		expect(screen.getByText('[ Cancelled ]')).toBeInTheDocument();
		expect(onClose).not.toHaveBeenCalled();

		fireEvent.keyDown(textarea, { key: 'x', ctrlKey: true });
		fireEvent.keyDown(textarea, { key: 'n' });
		expect(onClose).toHaveBeenCalledTimes(1);

		unmount();

		const onClose2 = jest.fn();
		render(
			<NanoEditor
				fileName="test.md"
				filePath="/home/gabriel/test.md"
				initialContent="hello"
				cwd="/home/gabriel"
				fs={defaultFs}
				setFs={setFs}
				onClose={onClose2}
				isDark={true}
			/>,
		);

		const textarea2 = screen.getByRole('textbox');
		fireEvent.change(textarea2, { target: { value: 'hello modified 2' } });
		fireEvent.keyDown(textarea2, { key: 'x', ctrlKey: true });
		fireEvent.keyDown(textarea2, { key: 'y' });
		expect(setFs).toHaveBeenCalled();
		expect(onClose2).toHaveBeenCalledTimes(1);
	});

	it('cuts and pastes text with Ctrl+K and Ctrl+U', () => {
		const onClose = jest.fn();
		const setFs = jest.fn();

		render(
			<NanoEditor
				fileName="test.md"
				filePath="/home/gabriel/test.md"
				initialContent={'line 1\nline 2\nline 3'}
				cwd="/home/gabriel"
				fs={defaultFs}
				setFs={setFs}
				onClose={onClose}
				isDark={true}
			/>,
		);

		const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
		textarea.selectionStart = 0;
		textarea.selectionEnd = 0;

		fireEvent.keyDown(textarea, { key: 'k', ctrlKey: true });
		expect(screen.getByText('[ Cut line ]')).toBeInTheDocument();

		fireEvent.keyDown(textarea, { key: 'u', ctrlKey: true });
		expect(screen.getByText('[ Pasted line ]')).toBeInTheDocument();
	});

	it('displays line count with Ctrl+C', () => {
		const onClose = jest.fn();
		const setFs = jest.fn();

		render(
			<NanoEditor
				fileName="test.md"
				filePath="/home/gabriel/test.md"
				initialContent={'line 1\nline 2'}
				cwd="/home/gabriel"
				fs={defaultFs}
				setFs={setFs}
				onClose={onClose}
				isDark={true}
			/>,
		);

		const textarea = screen.getByRole('textbox');
		fireEvent.keyDown(textarea, { key: 'c', ctrlKey: true });
		expect(screen.getByText('[ Line 2 lines total ]')).toBeInTheDocument();
	});

	it('syncPageStorage updates existing page or creates new markdown file', () => {
		(StorageService.getData as jest.Mock).mockReturnValue([
			{ index: 1, name: 'sobre-mim.md', route: 'sobre-mim', content: 'old' },
		]);

		syncPageStorage('sobre-mim.md', 'new content');
		expect(StorageService.saveOrUpdateData).toHaveBeenCalledWith({
			index: 1,
			name: 'sobre-mim.md',
			route: 'sobre-mim',
			content: 'new content',
			isSaved: true,
		});

		(StorageService.getData as jest.Mock).mockReturnValue([]);
		syncPageStorage('sobre-mim.html', '<p>New html</p>');
		expect(StorageService.saveOrUpdateData).toHaveBeenCalledWith({
			index: 0,
			name: 'sobre-mim.html',
			route: 'about-me',
			content: '<p>New html</p>',
			isSaved: true,
		});

		(StorageService.getData as jest.Mock).mockReturnValue([]);
		syncPageStorage('novo.md', 'new markdown');
		expect(StorageService.createFile).toHaveBeenCalledWith('novo.md', 'new markdown');
	});
});
