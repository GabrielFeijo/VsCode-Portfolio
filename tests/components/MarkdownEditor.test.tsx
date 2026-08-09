import { fireEvent, render, screen } from '@testing-library/react';
import MarkdownEditor from 'src/app/components/MarkdownEditor';

const highlightMock = jest.fn((code: string) => `highlighted:${code}`);

jest.mock('prismjs', () => ({
	highlight: (code: string, language: unknown, name: string) =>
		highlightMock(code, language, name),
	languages: { markdown: { name: 'markdown' } },
}));

jest.mock('prismjs/components/prism-markdown', () => ({}));

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
	}) => (
		<div>
			<textarea
				aria-label='Markdown editor'
				className={textareaClassName}
				value={value}
				onChange={(event) => onValueChange(event.target.value)}
			/>
			<pre className={preClassName}>{highlight(value)}</pre>
		</div>
	),
}));

describe('MarkdownEditor', () => {
	it('highlights markdown and propagates editor changes', () => {
		const onChange = jest.fn();
		render(<MarkdownEditor value='# Initial' onChange={onChange} />);

		expect(screen.getByText('highlighted:# Initial')).toHaveClass('code-editor-pre');
		expect(highlightMock).toHaveBeenCalledWith(
			'# Initial',
			expect.anything(),
			'markdown'
		);

		fireEvent.change(screen.getByRole('textbox', { name: 'Markdown editor' }), {
			target: { value: '# Updated' },
		});
		expect(onChange).toHaveBeenCalledWith('# Updated');
	});
});
