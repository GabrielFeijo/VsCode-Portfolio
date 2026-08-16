import { fireEvent, render, screen } from '@testing-library/react';
import MarkdownEditor from '../../src/app/components/MarkdownEditor';

const highlightMock = jest.fn(
	(code: string, _language: unknown, _name: string) => `highlighted:${code}`
);

jest.mock('prismjs', () => ({
	highlight: (code: string, language: unknown, name: string) =>
		highlightMock(code, language, name),
	languages: { markdown: { name: 'markdown' } },
}));

jest.mock('prismjs/components/prism-markdown', () => ({}));

let mockRenderTextarea = true;
let triggerChangeDuringMount = false;

jest.mock('react-simple-code-editor', () => ({
	__esModule: true,
	default: ({
		value,
		onValueChange,
		highlight,
		textareaClassName,
		preClassName,
	}: {
		value: string;
		onValueChange: (value: string) => void;
		highlight: (code: string) => string;
		textareaClassName: string;
		preClassName: string;
	}) => {
		if (triggerChangeDuringMount) {
			triggerChangeDuringMount = false;
			onValueChange(value);
		}
		return (
			<div>
				{mockRenderTextarea ? (
					<textarea
						aria-label='Markdown editor'
						className={textareaClassName}
						value={value}
						onChange={(event) => onValueChange(event.target.value)}
					/>
				) : null}
				<pre className={preClassName}>{highlight(value)}</pre>
			</div>
		);
	},
}));

describe('MarkdownEditor', () => {
	beforeEach(() => {
		mockRenderTextarea = true;
		triggerChangeDuringMount = false;
	});

	it('highlights markdown and propagates editor changes', () => {
		const onChange = jest.fn();
		render(<MarkdownEditor value='# Initial' onChange={onChange} />);

		expect(screen.getByText('highlighted:# Initial')).toHaveClass('code-editor-pre');
		expect(highlightMock).toHaveBeenCalledWith(
			'# Initial',
			expect.anything(),
			'markdown'
		);

		const textarea = screen.getByRole('textbox', { name: 'Markdown editor' });
		fireEvent.change(textarea, {
			target: { value: '# Updated' },
		});
		expect(onChange).toHaveBeenCalledWith('# Updated');
	});

	it('handles onValueChange before editorRef is attached', () => {
		triggerChangeDuringMount = true;
		const onChange = jest.fn();
		render(<MarkdownEditor value='Early' onChange={onChange} />);
		expect(onChange).toHaveBeenCalledWith('Early');
	});

	it('renders line numbers in the gutter', () => {
		render(<MarkdownEditor value={'Line 1\nLine 2\nLine 3'} onChange={jest.fn()} />);

		expect(screen.getByText('1')).toBeInTheDocument();
		expect(screen.getByText('2')).toBeInTheDocument();
		expect(screen.getByText('3')).toBeInTheDocument();
	});

	it('handles keyboard shortcuts Tab, Ctrl+B, Ctrl+I and normal keys', () => {
		const onChangeTab = jest.fn();
		const { container: containerTab } = render(
			<MarkdownEditor value='Sample' onChange={onChangeTab} />
		);
		fireEvent.keyDown(containerTab.firstChild as HTMLElement, { key: 'Tab' });
		expect(onChangeTab).toHaveBeenCalledWith('  Sample');

		const onChangeBold = jest.fn();
		const { container: containerBold } = render(
			<MarkdownEditor value='Sample' onChange={onChangeBold} />
		);
		fireEvent.keyDown(containerBold.firstChild as HTMLElement, {
			key: 'b',
			ctrlKey: true,
		});
		expect(onChangeBold).toHaveBeenCalledWith('**bold**Sample');

		const onChangeItalic = jest.fn();
		const { container: containerItalic } = render(
			<MarkdownEditor value='Sample' onChange={onChangeItalic} />
		);
		fireEvent.keyDown(containerItalic.firstChild as HTMLElement, {
			key: 'i',
			ctrlKey: true,
		});
		expect(onChangeItalic).toHaveBeenCalledWith('*italic*Sample');

		const onChangeOther = jest.fn();
		const { container: containerOther } = render(
			<MarkdownEditor value='Sample' onChange={onChangeOther} />
		);
		fireEvent.keyDown(containerOther.firstChild as HTMLElement, { key: 'x' });
		expect(onChangeOther).not.toHaveBeenCalled();
	});

	it('wraps selected text on Ctrl+B and Ctrl+I', () => {
		const onChange = jest.fn();
		const { container } = render(
			<MarkdownEditor value='Hello World' onChange={onChange} />
		);

		const textarea = screen.getByRole('textbox', {
			name: 'Markdown editor',
		}) as HTMLTextAreaElement;
		Object.defineProperty(textarea, 'value', {
			value: 'Hello World',
			writable: true,
		});
		textarea.selectionStart = 0;
		textarea.selectionEnd = 5;

		fireEvent.keyDown(container.firstChild as HTMLElement, {
			key: 'b',
			ctrlKey: true,
		});
		expect(onChange).toHaveBeenCalledWith('**Hello** World');
	});

	it('handles keyboard shortcuts and clicks when textarea is missing', () => {
		mockRenderTextarea = false;
		const onChange = jest.fn();
		const { container } = render(
			<MarkdownEditor value='Fallback' onChange={onChange} />
		);

		const editorRoot = container.firstChild as HTMLElement;
		fireEvent.keyDown(editorRoot, { key: 'Tab' });
		expect(onChange).not.toHaveBeenCalled();

		fireEvent.keyDown(editorRoot, { key: 'b', ctrlKey: true });
		expect(onChange).toHaveBeenCalledWith('Fallback**bold**');

		fireEvent.keyDown(editorRoot, { key: 'i', ctrlKey: true });
		expect(onChange).toHaveBeenCalledWith('Fallback*italic*');

		fireEvent.click(editorRoot);
		fireEvent.keyUp(editorRoot);
	});

	it('handles missing editor container in querySelector', () => {
		const onChange = jest.fn();
		const { container } = render(
			<MarkdownEditor value='Sample' onChange={onChange} />
		);
		const editorRoot = container.firstChild as HTMLElement;
		const editorBox = editorRoot.children[0] as HTMLElement;

		const originalQuerySelector = editorBox.querySelector.bind(editorBox);
		editorBox.querySelector = () => null;

		fireEvent.keyDown(editorRoot, { key: 'Tab' });
		expect(onChange).not.toHaveBeenCalled();

		fireEvent.click(editorBox);
		fireEvent.keyUp(editorBox);

		editorBox.querySelector = originalQuerySelector;
	});

	it('updates cursor line and column on click and keyup', () => {
		const onChange = jest.fn();
		render(<MarkdownEditor value={'Line 1\nLine 2'} onChange={onChange} />);

		const textarea = screen.getByRole('textbox', {
			name: 'Markdown editor',
		}) as HTMLTextAreaElement;
		Object.defineProperty(textarea, 'value', {
			value: 'Line 1\nLine 2',
			writable: true,
		});
		textarea.selectionStart = 8;
		textarea.selectionEnd = 8;

		fireEvent.click(textarea);
		fireEvent.keyUp(textarea);

		expect(screen.getByText(/Ln 2, Col 2/)).toBeInTheDocument();
	});

	it('handles cursor updates when selectionStart is 0', () => {
		render(<MarkdownEditor value='Sample text' onChange={jest.fn()} />);

		const textarea = screen.getByRole('textbox', {
			name: 'Markdown editor',
		}) as HTMLTextAreaElement;
		Object.defineProperty(textarea, 'value', {
			value: 'Sample text',
			writable: true,
		});
		textarea.selectionStart = 0;
		textarea.selectionEnd = 0;

		fireEvent.click(textarea);
		expect(screen.getByText(/Ln 1, Col 1/)).toBeInTheDocument();
	});

	it('handles empty value metrics calculation', () => {
		render(<MarkdownEditor value='' onChange={jest.fn()} />);
		expect(screen.getByText(/0 words/)).toBeInTheDocument();
		expect(screen.getByText(/0 chars/)).toBeInTheDocument();
	});
});
