import { Box, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { Page } from '@/domain/page';
import { StorageService } from '@/services/storageService';
import { getAppPalette } from '@/app/theme/palette';
import { fonts } from '@/app/theme/typography';
import { pageRoutes } from '@/app/pages/pages';
import { VirtualDirectory } from './types';
import { normalizePath } from './utils/pathUtils';
import { notifyStorageChange } from '@/utils/appEvents';
import { stripFileExtension } from '@/utils/stripFileExtension';
import { getPageNameAliases, isSamePageName } from '@/utils/pageName';

interface NanoEditorProps {
	fileName: string;
	filePath: string;
	initialContent: string;
	cwd: string;
	fs: VirtualDirectory;
	setFs: React.Dispatch<React.SetStateAction<VirtualDirectory>>;
	onClose: () => void;
	onSave?: (fileName: string, content: string) => void;
	isDark: boolean;
}

function buildPageMap(): Record<string, { index: number; route: string; name: string }> {
	const map: Record<string, { index: number; route: string; name: string }> = {};
	for (const pages of Object.values(pageRoutes)) {
		for (const page of pages) {
			const base = stripFileExtension(page.name);
			const entry = { index: page.index, route: page.route, name: page.name };
			for (const key of [...getPageNameAliases(page.name), base]) {
				map[key] = entry;
			}
		}
	}
	return map;
}

const PAGE_MAP = buildPageMap();

const NANO_SHORTCUTS = [
	{ key: '^G', label: 'Get Help' },
	{ key: '^O', label: 'WriteOut' },
	{ key: '^W', label: 'Where Is' },
	{ key: '^K', label: 'Cut Text' },
	{ key: '^J', label: 'Justify' },
	{ key: '^C', label: 'Cur Pos' },
	{ key: '^X', label: 'Exit' },
	{ key: '^R', label: 'Read File' },
	{ key: '^\\', label: 'Replace' },
	{ key: '^U', label: 'Paste Text' },
	{ key: '^T', label: 'To Spell' },
	{ key: '^S', label: 'Save' },
] as const;

function resolvePageData(fileName: string, content: string): Page {
	const storedPages = StorageService.getData();
	const baseName = stripFileExtension(fileName);
	const targetPage = storedPages.find((p) => isSamePageName(p.name, fileName));

	if (targetPage) {
		return { ...targetPage, content, isSaved: true };
	}

	const meta = [...getPageNameAliases(fileName), baseName]
		.map((key) => PAGE_MAP[key])
		.find(Boolean);
	if (meta) {
		return {
			index: meta.index,
			name: fileName.includes('.') ? fileName : meta.name,
			route: meta.route,
			content,
			isSaved: true,
		};
	}

	return StorageService.createFile(fileName, content);
}

export function syncPageStorage(fileName: string, content: string): void {
	const pageData = resolvePageData(fileName, content);
	StorageService.saveOrUpdateData(pageData);
	notifyStorageChange();
}

export default function NanoEditor({
	fileName,
	filePath,
	initialContent,
	cwd,
	setFs,
	onClose,
	onSave,
	isDark,
}: NanoEditorProps) {
	const [content, setContent] = useState(initialContent);
	const [isModified, setIsModified] = useState(false);
	const [status, setStatus] = useState(`[ Read ${initialContent.split('\n').length} lines ]`);
	const [promptSave, setPromptSave] = useState(false);
	const [clipboard, setClipboard] = useState('');
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const palette = getAppPalette(isDark ? 'dark' : 'light');
	const lineCount = content.split('\n').length;


	useEffect(() => {
		textareaRef.current?.focus();
	}, []);

	const saveContent = (textToSave = content) => {
		const normalized = normalizePath(cwd, filePath);
		const parent = normalized.substring(0, normalized.lastIndexOf('/')) || '/';
		const name = normalized.substring(normalized.lastIndexOf('/') + 1);
		const lines = textToSave.split('\n');

		setFs((prevFs) => {
			const nextFs: VirtualDirectory = { ...prevFs };
			nextFs[parent] = [...(nextFs[parent] || [])];

			const existingIndex = nextFs[parent].findIndex(
				(e) => e.name === name && e.type === 'file',
			);

			if (existingIndex >= 0) {
				nextFs[parent][existingIndex] = {
					name,
					type: 'file',
					content: lines,
				};
			} else {
				nextFs[parent].push({
					name,
					type: 'file',
					content: lines,
				});
			}

			return nextFs;
		});

		syncPageStorage(name, textToSave);
		onSave?.(name, textToSave);
		setIsModified(false);
		setStatus(`[ Wrote ${lines.length} lines to ${name} ]`);
	};

	const cutCurrentLine = (textarea: HTMLTextAreaElement) => {
		const { value, selectionStart } = textarea;
		const lineStart = value.substring(0, selectionStart).lastIndexOf('\n') + 1;
		const nextBreak = value.indexOf('\n', selectionStart);
		const lineEnd = nextBreak === -1 ? value.length : nextBreak + 1;

		setClipboard(value.substring(lineStart, lineEnd));
		setContent(value.substring(0, lineStart) + value.substring(lineEnd));
		setIsModified(true);
		setStatus('[ Cut line ]');
	};

	const pasteClipboardLine = (textarea: HTMLTextAreaElement) => {
		if (!clipboard) return;

		const { selectionStart } = textarea;
		setContent(content.substring(0, selectionStart) + clipboard + content.substring(selectionStart));
		setIsModified(true);
		setStatus('[ Pasted line ]');
	};

	const reportCursorPosition = (textarea: HTMLTextAreaElement) => {
		const currentLine = content.substring(0, textarea.selectionStart).split('\n').length;
		setStatus(`[ line ${currentLine}/${lineCount} ]`);
	};

	const requestExit = () => {
		if (!isModified) {
			onClose();
			return;
		}
		setPromptSave(true);
		setStatus('Save modified buffer? (Y/N/Ctrl+C)');
	};

	const handleSavePromptKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		e.preventDefault();
		const key = e.key.toLowerCase();

		if (key === 'y' || key === 's') {
			saveContent();
			onClose();
		} else if (key === 'n') {
			onClose();
		} else if ((e.key === 'c' && e.ctrlKey) || e.key === 'Escape') {
			setPromptSave(false);
			setStatus('[ Cancelled ]');
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		e.stopPropagation();

		if (promptSave) {
			handleSavePromptKey(e);
			return;
		}

		if (!e.ctrlKey) return;

		const textarea = e.currentTarget;
		switch (e.key) {
			case 'o':
			case 's':
				e.preventDefault();
				saveContent();
				break;
			case 'x':
				e.preventDefault();
				requestExit();
				break;
			case 'k':
				e.preventDefault();
				cutCurrentLine(textarea);
				break;
			case 'u':
				e.preventDefault();
				pasteClipboardLine(textarea);
				break;
			case 'c':
				e.preventDefault();
				reportCursorPosition(textarea);
				break;
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setContent(e.target.value);
		setIsModified(true);
	};

	return (
		<Box
			sx={{
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				backgroundColor: palette.bgSecondary,
				color: palette.textPrimary,
				fontFamily: fonts.mono,
				fontSize: '0.85rem',
				overflow: 'hidden',
			}}
		>
			<Box
				sx={{
					px: 1.5,
					py: 0.25,
					backgroundColor: palette.bgElevated,
					color: palette.textPrimary,
					display: 'flex',
					justifyContent: 'space-between',
					fontWeight: 600,
					fontSize: '0.8rem',
				}}
			>
				<Typography variant="caption" sx={{ fontFamily: 'inherit', fontWeight: 'bold' }}>
					GNU nano 7.2
				</Typography>
				<Typography variant="caption" sx={{ fontFamily: 'inherit' }}>
					File: {fileName}
				</Typography>
				<Typography
					variant="caption"
					sx={{
						fontFamily: 'inherit',
						color: isModified ? palette.accentYellow : 'inherit',
						fontWeight: isModified ? 'bold' : 'normal',
					}}
				>
					{isModified ? '[Modified]' : ''}
				</Typography>
			</Box>

			<Box
				sx={{
					flex: 1,
					display: 'flex',
					position: 'relative',
					overflow: 'hidden',
				}}
			>
				<Box
					sx={{
						py: 1,
						px: 1,
						userSelect: 'none',
						textAlign: 'right',
						color: palette.textMuted,
						backgroundColor: palette.bgTertiary,
						minWidth: '2.5rem',
					}}
				>
					{Array.from({ length: lineCount }, (_, i) => i + 1).map((lineNumber) => (
						<div key={lineNumber}>{lineNumber}</div>
					))}
				</Box>

				<textarea
					ref={textareaRef}
					value={content}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					spellCheck={false}
					autoCapitalize="off"
					autoComplete="off"
					autoCorrect="off"
					style={{
						flex: 1,
						height: '100%',
						backgroundColor: 'transparent',
						color: 'inherit',
						border: 'none',
						outline: 'none',
						resize: 'none',
						fontFamily: fonts.mono,
						fontSize: 'inherit',
						padding: '8px',
						lineHeight: '1.4',
						whiteSpace: 'pre',
						overflowWrap: 'normal',
						overflowX: 'auto',
					}}
				/>
			</Box>

			<Box
				sx={{
					px: 1.5,
					py: 0.25,
					backgroundColor: promptSave ? palette.error : palette.bgElevated,
					color: promptSave ? palette.textInverse : palette.accentCyan,
					fontWeight: 500,
					fontSize: '0.8rem',
				}}
			>
				{status}
			</Box>

			<Box
				sx={{
					p: 0.5,
					backgroundColor: palette.bgTertiary,
					display: 'grid',
					gridTemplateColumns: 'repeat(6, 1fr)',
					gap: 0.5,
					fontSize: '0.72rem',
					borderTop: `1px solid ${palette.border}`,
				}}
			>
				{NANO_SHORTCUTS.map(({ key, label }) => (
					<div key={key}>
						<span style={{ color: palette.accentCyan, fontWeight: 'bold' }}>{key}</span> {label}
					</div>
				))}
			</Box>
		</Box>
	);
}
