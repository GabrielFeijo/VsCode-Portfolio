import { Box } from '@mui/material';
import { useCallback, useMemo, useRef, useState } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-markdown';
import 'prismjs/themes/prism-tomorrow.css';
import { fonts } from '../theme/typography';
import { useAppPalette } from '../theme/useAppPalette';

interface Props {
	value: string;
	onChange: (value: string) => void;
}

export default function MarkdownEditor({ value, onChange }: Props) {
	const palette = useAppPalette();
	const editorRef = useRef<HTMLDivElement>(null);
	const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

	const lines = useMemo(() => value.split('\n'), [value]);
	const lineCount = Math.max(lines.length, 1);
	const wordCount = useMemo(() => {
		const trimmed = value.trim();
		return trimmed ? trimmed.split(/\s+/).length : 0;
	}, [value]);

	const updateCursor = useCallback((textarea: HTMLTextAreaElement) => {
		const selStart = textarea.selectionStart;
		const textBefore = textarea.value.substring(0, selStart);
		const lineList = textBefore.split('\n');
		setCursorPos({
			line: lineList.length,
			col: lineList[lineList.length - 1].length + 1,
		});
	}, []);

	const getTextarea = useCallback((): HTMLTextAreaElement | null => {
		return editorRef.current?.querySelector('textarea') ?? null;
	}, []);

	const wrapSelection = useCallback(
		(before: string, after: string, defaultText: string) => {
			const textarea = getTextarea();
			if (!textarea) {
				onChange(`${value}${before}${defaultText}${after}`);
				return;
			}

			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;
			const selected = value.substring(start, end) || defaultText;
			const replacement = `${before}${selected}${after}`;
			const nextValue = value.substring(0, start) + replacement + value.substring(end);

			onChange(nextValue);
			textarea.focus();
			textarea.setSelectionRange(
				start + before.length,
				start + before.length + selected.length
			);
		},
		[getTextarea, onChange, value]
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>) => {
			if (e.key === 'Tab') {
				e.preventDefault();
				const textarea = getTextarea();
				if (!textarea) return;
				const start = textarea.selectionStart;
				const end = textarea.selectionEnd;
				const nextValue = value.substring(0, start) + '  ' + value.substring(end);
				onChange(nextValue);
				textarea.focus();
				textarea.setSelectionRange(start + 2, start + 2);
				return;
			}

			if (e.ctrlKey && e.key.toLowerCase() === 'b') {
				e.preventDefault();
				wrapSelection('**', '**', 'bold');
				return;
			}

			if (e.ctrlKey && e.key.toLowerCase() === 'i') {
				e.preventDefault();
				wrapSelection('*', '*', 'italic');
			}
		},
		[getTextarea, onChange, value, wrapSelection]
	);

	const handleCursorSync = useCallback(() => {
		const textarea = getTextarea();
		if (textarea) updateCursor(textarea);
	}, [getTextarea, updateCursor]);

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				width: '100%',
				backgroundColor: palette.bgSidebar,
				color: palette.textPrimary,
				fontFamily: fonts.mono,
				overflow: 'hidden',
			}}
			onKeyDown={handleKeyDown}
		>
			<Box
				ref={editorRef}
				sx={{
					display: 'flex',
					flex: 1,
					overflow: 'auto',
					position: 'relative',
					backgroundColor: palette.bgSidebar,
				}}
				onClick={handleCursorSync}
				onKeyUp={handleCursorSync}
			>
				<Box
					aria-hidden='true'
					sx={{
						py: 1,
						px: 1.5,
						minWidth: '2.8rem',
						textAlign: 'right',
						userSelect: 'none',
						color: palette.textSecondary,
						opacity: 0.5,
						fontSize: 13,
						lineHeight: '1.6',
						fontFamily: fonts.mono,
						borderRight: `1px solid ${palette.border}`,
						backgroundColor: palette.bgSidebar,
					}}
				>
					{Array.from({ length: lineCount }, (_, i) => (
						<div key={i}>{i + 1}</div>
					))}
				</Box>

				<Box
					sx={{
						flex: 1,
						minWidth: 0,
						p: 0,
						'& .code-editor-textarea': {
							outline: 'none !important',
							padding: '8px 12px !important',
							lineHeight: '1.6 !important',
							fontSize: '13px !important',
							fontFamily: `${fonts.mono} !important`,
							color: 'inherit !important',
						},
						'& .code-editor-pre': {
							padding: '8px 12px !important',
							lineHeight: '1.6 !important',
							fontSize: '13px !important',
							fontFamily: `${fonts.mono} !important`,
						},
					}}
				>
					<Editor
						value={value}
						onValueChange={(val) => {
							onChange(val);
							handleCursorSync();
						}}
						highlight={(code) => highlight(code, languages.markdown, 'markdown')}
						style={{
							fontFamily: fonts.mono,
							fontSize: 13,
							lineHeight: '1.6',
							minHeight: '100%',
						}}
						textareaClassName='code-editor-textarea'
						preClassName='code-editor-pre'
					/>
				</Box>
			</Box>

			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					px: 1.5,
					py: 0.3,
					fontSize: '11px',
					color: palette.textSecondary,
					backgroundColor: palette.bgElevated,
					borderTop: `1px solid ${palette.border}`,
					userSelect: 'none',
				}}
			>
				<Box sx={{ display: 'flex', gap: 2 }}>
					<span>
						Ln {cursorPos.line}, Col {cursorPos.col}
					</span>
					<span>
						{lines.length} lines &bull; {wordCount} words &bull; {value.length} chars
					</span>
				</Box>
				<Box sx={{ display: 'flex', gap: 1.5 }}>
					<span>Markdown</span>
					<span>UTF-8</span>
				</Box>
			</Box>
		</Box>
	);
}
