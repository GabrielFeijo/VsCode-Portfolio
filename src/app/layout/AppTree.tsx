import * as React from 'react';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useAppPalette } from '../theme/useAppPalette';
import {
	VscMarkdown,
	VscNewFile,
	VscNewFolder,
	VscRefresh,
	VscCheck,
	VscClose,
} from 'react-icons/vsc';
import { convertFileName } from '../../utils/convertFileName';
import { useTranslation } from 'react-i18next';
import { Box, IconButton, InputBase } from '@mui/material';
import { StorageService } from '../../services/storageService';
import { Language, Page } from '../../domain/page';
import ContextMenu from '../components/ContextMenu/ContextMenu';
import { normalizeFileName } from '../../utils/normalizeFileName';
import { getBasePath, getLocalizedPath } from '../../config/seo';
import { siteConfig } from '../../config/site';
import { useEditorContext } from '../../contexts/EditorContext';

interface Props {
	language: Language;
}

export default function AppTree({ language }: Props) {
	const {
		pages,
		setPages,
		selectedIndex,
		setSelectedIndex,
		currentComponent,
		setCurrentComponent,
		visiblePageIndexes,
		setVisiblePageIndexes,
	} = useEditorContext();
	const navigate = useNavigate();
	const colors = useAppPalette();
	const { t } = useTranslation();
	const { pathname } = useLocation();
	const [isCreatingFile, setIsCreatingFile] = useState(false);
	const [newFileName, setNewFileName] = useState('');
	const fileInputRef = useRef<HTMLInputElement>(null);

	const page: Page | undefined = pages.find(
		(item) => `/${item.route}` === getBasePath(pathname)
	);

	useEffect(() => {
		if (page) {
			setSelectedIndex(page.index);
		}
	}, [page, setSelectedIndex]);

	useEffect(() => {
		if (isCreatingFile && fileInputRef.current) {
			fileInputRef.current.focus();
		}
	}, [isCreatingFile]);

	function renderTreeItemBgColor(index: number) {
		return selectedIndex === index ? colors.bgElevated : colors.bgExplorer;
	}

	function renderTreeItemColor(index: number) {
		if (selectedIndex === index && currentComponent === 'tree') {
			return colors.textPrimary;
		}
		return selectedIndex === index ? colors.accent : colors.textSecondary;
	}

	function handleCreateFile(e: React.MouseEvent) {
		e.stopPropagation();
		setIsCreatingFile(true);
	}

	function handleConfirmCreateFile(e?: React.MouseEvent) {
		e?.stopPropagation();
		createNewFile();
	}

	function handleCancelCreateFile(e?: React.MouseEvent) {
		e?.stopPropagation();
		resetFileCreationState();
	}

	function resetFileCreationState() {
		setIsCreatingFile(false);
		setNewFileName('');
	}

	function openFile(page: Page) {
		if (!visiblePageIndexes.includes(page.index)) {
			setVisiblePageIndexes((prev) => [...prev, page.index]);
		}
		setSelectedIndex(page.index);
		navigate(getLocalizedPath(`/${page.route}`, language));
	}

	function createNewFile() {
		const rawName = newFileName.trim();
		if (rawName === '') {
			resetFileCreationState();
			return;
		}

		const baseName = rawName.replace(/\.(md|html)$/i, '');
		const normalizedName = normalizeFileName(baseName);
		const fullFileName = `${normalizedName || 'novo-arquivo'}.md`;
		const existingPage = pages.find(
			(x) => x.name === fullFileName || x.route === fullFileName
		);

		if (existingPage) {
			openFile(existingPage);
			resetFileCreationState();
			return;
		}

		const newFile = StorageService.createFile(fullFileName);
		StorageService.saveOrUpdateData(newFile);
		setPages([...pages, newFile]);
		openFile(newFile);
		resetFileCreationState();
	}

	function handleKeyDown(e: React.KeyboardEvent) {
		e.stopPropagation();
		const keyActions: Record<string, () => void> = {
			Enter: createNewFile,
			Escape: handleCancelCreateFile,
		};

		const action = keyActions[e.key];
		if (action) {
			e.preventDefault();
			action();
		}
	}

	const handleDeleteFile = (pageIndex: number) => {
		setPages((prev) => prev.filter((x) => x.index !== pageIndex));
		setVisiblePageIndexes((prev) => prev.filter((x) => x !== pageIndex));
		StorageService.deleteFile(pageIndex);
		setSelectedIndex(0);
		navigate(getLocalizedPath('/about-me', language));
	};

	const [contextMenu, setContextMenu] = useState<{
		mouseX: number;
		mouseY: number;
		pageIndex: number | null;
	} | null>(null);

	const handleContextMenu = (event: React.MouseEvent, index: number) => {
		event.preventDefault();
		setContextMenu(
			contextMenu === null
				? {
					mouseX: event.clientX - 2,
					mouseY: event.clientY - 4,
					pageIndex: index,
				}
				: null
		);
	};

	const handleClose = () => {
		setContextMenu(null);
	};

	const handleDelete = () => {
		handleDeleteFile(contextMenu!.pageIndex!);
		handleClose();
	};
	const handleOpenFile = () => {
		const existingPage = pages.find((x) => x.index === contextMenu!.pageIndex);

		if (!existingPage) return;

		openFile(existingPage);
		handleClose();
	};

	const handleOpenFileOnGithub = () => {
		const existingPage = pages.find((x) => x.index === contextMenu!.pageIndex);

		if (!existingPage) return;

		window.open(
			`${siteConfig.repoUrl}/tree/main/src/pages/${language}/${existingPage.name}`,
			'_blank',
			'noopener,noreferrer'
		);
		handleClose();
	};

	return (
		<>
			<SimpleTreeView
				aria-label='file system navigator'
				sx={{
					minWidth: 220,
					'& .MuiTreeItem-content': {
						paddingTop: 0,
						paddingBottom: 0,
					},
				}}
				defaultExpandedItems={['-1']}
			>
				<TreeItem
					itemId='-1'
					label={
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								width: '100%',
							}}
						>
							{t('pages.home')}
							<Box sx={{ display: 'flex' }}>
								<IconButton
									size='small'
									aria-label={t('sidebar.createFile') || 'Create new file'}
									onClick={handleCreateFile}
								>
									<VscNewFile size={16} />
								</IconButton>
								<IconButton
									size='small'
									aria-label={t('sidebar.createFolder') || 'Create new folder'}
									onClick={(e: React.MouseEvent) => {
										e.stopPropagation();
									}}
								>
									<VscNewFolder size={16} />
								</IconButton>
								<IconButton
									size='small'
									aria-label={t('sidebar.refresh') || 'Refresh'}
									onClick={(e: React.MouseEvent) => {
										e.stopPropagation();
									}}
								>
									<VscRefresh size={16} />
								</IconButton>
							</Box>
						</Box>
					}
					color='#bdc3cf'
				>
					{pages.map(({ index, name, route, isSaved }) => (
						<TreeItem
							key={index}
							onContextMenu={(event) => handleContextMenu(event, index)}
							itemId={index.toString()}
							label={
								<Box
									sx={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
										width: '100%',
										maxWidth: '10rem',
										gap: 1,
									}}
								>
									<span
										style={{
											whiteSpace: 'nowrap',
											overflow: 'hidden',
											textOverflow: 'ellipsis',
										}}
									>
										{convertFileName(name)}
									</span>
									{isSaved !== undefined && !isSaved && (
										<Box
											sx={{
												backgroundColor: colors.accentPink,
												borderRadius: '100%',
												width: '10px',
												height: '10px',
											}}
										></Box>
									)}
								</Box>
							}
							sx={{
								color: renderTreeItemColor(index),
								backgroundColor: renderTreeItemBgColor(index),
								'&& .Mui-selected': {
									backgroundColor: renderTreeItemBgColor(index),
								},
							}}
							slots={{ icon: () => <VscMarkdown color={colors.iconMarkdown} /> }}
							onClick={() => {
								if (!visiblePageIndexes.includes(index)) {
									const newIndexes = [...visiblePageIndexes, index];
									setVisiblePageIndexes(newIndexes);
								}
								navigate(getLocalizedPath(`/${route}`, language));
								setSelectedIndex(index);
								setCurrentComponent('tree');
							}}
						/>
					))}

					{isCreatingFile && (
						<TreeItem
							itemId='-2'
							slots={{ icon: () => <VscMarkdown color={colors.iconMarkdown} /> }}
							label={
								<Box
									sx={{
										maxWidth: '100%',
									}}
								>
									<InputBase
										inputRef={fileInputRef}
										value={newFileName}
										onChange={(e) => setNewFileName(e.target.value)}
										onKeyDown={handleKeyDown}
										placeholder={t('prompts.enter_filename')}
										sx={{
											color: renderTreeItemColor(-2),
											maxWidth: '10rem',
											'&& .MuiInputBase-input': {
												p: 0,
												m: 0,
											},
										}}
										endAdornment={
											<>
												<IconButton
													size='small'
													aria-label={t('sidebar.confirm') || 'Confirm'}
													onClick={handleConfirmCreateFile}
												>
													<VscCheck size={12} />
												</IconButton>
												<IconButton
													size='small'
													aria-label={t('sidebar.cancel') || 'Cancel'}
													onClick={handleCancelCreateFile}
												>
													<VscClose size={12} />
												</IconButton>
											</>
										}
									/>
								</Box>
							}
						/>
					)}
				</TreeItem>
			</SimpleTreeView>

			<ContextMenu
				contextMenu={contextMenu}
				handleOpenFile={handleOpenFile}
				handleOpenFileOnGithub={handleOpenFileOnGithub}
				handleClose={handleClose}
				handleDelete={handleDelete}
			/>
		</>
	);
}
