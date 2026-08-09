import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-markdown';
import 'prismjs/themes/prism-tomorrow.css';

interface Props {
	value: string;
	onChange: (value: string) => void;
}

export default function MarkdownEditor({ value, onChange }: Props) {
	return (
		<Editor
			value={value}
			onValueChange={onChange}
			highlight={(code) => highlight(code, languages.markdown, 'markdown')}
			style={{
				fontFamily: '"Fira Code", "Fira Mono", monospace',
				fontSize: 14,
				lineHeight: '1.5',
				height: '100%',
			}}
			textareaClassName='code-editor-textarea'
			preClassName='code-editor-pre'
		/>
	);
}
