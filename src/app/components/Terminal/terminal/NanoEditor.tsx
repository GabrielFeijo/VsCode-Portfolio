import { Box, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { Page } from '@/domain/page';
import { StorageService } from '@/services/storageService';
import { fonts } from '@/app/theme/typography';
import { pageRoutes } from '@/app/pages/pages';
import { VirtualDirectory } from './types';
import { normalizePath } from './utils/pathUtils';

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

import { stripFileExtension } from '@/utils/stripFileExtension';

function buildPageMap(): Record<string, { index: number; route: string; name: string }> {
	const map: Record<string, { index: number; route: string; name: string }> = {};
	for (const pages of Object.values(pageRoutes)) {
		for (const page of pages) {
			const base = stripFileExtension(page.name);
			const entry = { index: page.index, route: page.route, name: page.name };
			map[page.name] = entry;
			map[`${base}.html`] = entry;
			map[`${base}.md`] = entry;
			map[base] = entry;
		}
	}
	return map;
}

const PAGE_MAP = buildPageMap();

function resolvePageData(fileName: string, content: string): Page {
	const storedPages = StorageService.getData();
	const baseName = stripFileExtension(fileName);
	const targetPage = storedPages.find(
		(p) =>
			p.name === fileName ||
			p.name === `${baseName}.md` ||
			p.name === `${baseName}.html`
	);

	if (targetPage) {
		return { ...targetPage, content, isSaved: true };
	}

	const meta = PAGE_MAP[fileName] || PAGE_MAP[`${baseName}.html`] || PAGE_MAP[`${baseName}.md`] || PAGE_MAP[baseName];
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
	window.dispatchEvent(new Event('storage'));
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

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		e.stopPropagation();
		if (promptSave) {
			if (e.key === 'y' || e.key === 'Y' || e.key === 's' || e.key === 'S') {
				e.preventDefault();
				saveContent();
				onClose();
				return;
			}
			if (e.key === 'n' || e.key === 'N') {
				e.preventDefault();
				onClose();
				return;
			}
			if ((e.key === 'c' && e.ctrlKey) || e.key === 'Escape') {
				e.preventDefault();
				setPromptSave(false);
				setStatus('[ Cancelled ]');
				return;
			}
			e.preventDefault();
			return;
		}

		if ((e.key === 'o' && e.ctrlKey) || (e.key === 's' && e.ctrlKey)) {
			e.preventDefault();
			saveContent();
			return;
		}

		if (e.key === 'x' && e.ctrlKey) {
			e.preventDefault();
			if (isModified) {
				setPromptSave(true);
				setStatus('Save modified buffer? (Y/N/Ctrl+C)');
			} else {
				onClose();
			}
			return;
		}

		if (e.key === 'k' && e.ctrlKey) {
			e.preventDefault();
			const textarea = e.currentTarget;

			const val = textarea.value;
			const selStart = textarea.selectionStart;
			const before = val.substring(0, selStart);
			const lineStart = before.lastIndexOf('\n') + 1;
			const after = val.substring(selStart);
			const lineEndIdx = after.indexOf('\n');
			const lineEnd = lineEndIdx === -1 ? val.length : selStart + lineEndIdx + 1;

			const cutText = val.substring(lineStart, lineEnd);
			const remaining = val.substring(0, lineStart) + val.substring(lineEnd);

			setClipboard(cutText);
			setContent(remaining);
			setIsModified(true);
			setStatus(`[ Cut line ]`);
			return;
		}

		if (e.key === 'u' && e.ctrlKey) {
			e.preventDefault();
			if (!clipboard) return;
			const textarea = e.currentTarget;

			const selStart = textarea.selectionStart;
			const nextContent = content.substring(0, selStart) + clipboard + content.substring(selStart);
			setContent(nextContent);
			setIsModified(true);
			setStatus(`[ Pasted line ]`);
			return;
		}

		if (e.key === 'c' && e.ctrlKey) {
			e.preventDefault();
			setStatus(`[ Line ${lineCount} lines total ]`);
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
				backgroundColor: isDark ? '#181824' : '#f5f5f5',
				color: isDark ? '#e0e0e0' : '#1e1e1e',
				fontFamily: fonts.mono,
				fontSize: '0.85rem',
				overflow: 'hidden',
			}}
		>
			<Box
				sx={{
					px: 1.5,
					py: 0.25,
					backgroundColor: isDark ? '#2e3440' : '#d8dee9',
					color: isDark ? '#eceff4' : '#2e3440',
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
						color: isModified ? '#ebcb8b' : 'inherit',
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
						color: isDark ? '#4c566a' : '#9aa0a6',
						backgroundColor: isDark ? '#14141e' : '#eceff4',
						minWidth: '2.5rem',
					}}
				>
					{Array.from({ length: lineCount }, (_, i) => (
						<div key={i + 1}>{i + 1}</div>
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
					backgroundColor: promptSave ? '#bf616a' : isDark ? '#242933' : '#e5e9f0',
					color: promptSave ? '#fff' : isDark ? '#88c0d0' : '#2e3440',
					fontWeight: 500,
					fontSize: '0.8rem',
				}}
			>
				{status}
			</Box>

			<Box
				sx={{
					p: 0.5,
					backgroundColor: isDark ? '#1a1b26' : '#d8dee9',
					display: 'grid',
					gridTemplateColumns: 'repeat(6, 1fr)',
					gap: 0.5,
					fontSize: '0.72rem',
					borderTop: `1px solid ${isDark ? '#2e3440' : '#c0c8d0'}`,
				}}
			>
				<div><span style={{ color: '#88c0d0', fontWeight: 'bold' }}>^G</span> Get Help</div>
				<div><span style={{ color: '#88c0d0', fontWeight: 'bold' }}>^O</span> WriteOut</div>
				<div><span style={{ color: '#88c0d0', fontWeight: 'bold' }}>^W</span> Where Is</div>
				<div><span style={{ color: '#88c0d0', fontWeight: 'bold' }}>^K</span> Cut Text</div>
				<div><span style={{ color: '#88c0d0', fontWeight: 'bold' }}>^J</span> Justify</div>
				<div><span style={{ color: '#88c0d0', fontWeight: 'bold' }}>^C</span> Cur Pos</div>

				<div><span style={{ color: '#88c0d0', fontWeight: 'bold' }}>^X</span> Exit</div>
				<div><span style={{ color: '#88c0d0', fontWeight: 'bold' }}>^R</span> Read File</div>
				<div><span style={{ color: '#88c0d0', fontWeight: 'bold' }}>^\</span> Replace</div>
				<div><span style={{ color: '#88c0d0', fontWeight: 'bold' }}>^U</span> Paste Text</div>
				<div><span style={{ color: '#88c0d0', fontWeight: 'bold' }}>^T</span> To Spell</div>
				<div><span style={{ color: '#88c0d0', fontWeight: 'bold' }}>^S</span> Save</div>
			</Box>
		</Box>
	);
}
