import React, { useCallback, useEffect } from 'react';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { useLocation, useNavigate } from 'react-router-dom';
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
import { Language, Page } from '../../domain/page';
import ContextMenu from '../components/ContextMenu/ContextMenu';
import { getBasePath, getLocalizedPath } from '../../config/seo';
import { useEditorContext } from '../../contexts/EditorContext';
import { useFileCreation } from '../hooks/useFileCreation';
import { useTreeContextMenu } from '../hooks/useTreeContextMenu';

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

	const page: Page | undefined = pages.find(
		(item) => `/${item.route}` === getBasePath(pathname)
	);

	useEffect(() => {
		if (page) {
			setSelectedIndex(page.index);
		}
	}, [page, setSelectedIndex]);

	const openFile = useCallback((filePage: Page) => {
		if (!visiblePageIndexes.includes(filePage.index)) {
			setVisiblePageIndexes((prev) => [...prev, filePage.index]);
		}
		setSelectedIndex(filePage.index);
		navigate(getLocalizedPath(`/${filePage.route}`, language));
	}, [language, navigate, setSelectedIndex, setVisiblePageIndexes, visiblePageIndexes]);

	const {
		isCreatingFile,
		newFileName,
		setNewFileName,
		fileInputRef,
		handleCreateFile,
		handleConfirmCreateFile,
		handleCancelCreateFile,
		handleKeyDown,
	} = useFileCreation({ pages, setPages, openFile });

	const {
		contextMenu,
		handleContextMenu,
		handleClose,
		handleDelete,
		handleOpenFile,
		handleOpenFileOnGithub,
	} = useTreeContextMenu({
		pages,
		setPages,
		setVisiblePageIndexes,
		setSelectedIndex,
		navigate,
		language,
		openFile,
	});

	function renderTreeItemBgColor(index: number) {
		return selectedIndex === index ? colors.bgElevated : colors.bgExplorer;
	}

	function renderTreeItemColor(index: number) {
		if (selectedIndex === index && currentComponent === 'tree') {
			return colors.textPrimary;
		}
		return selectedIndex === index ? colors.accent : colors.textSecondary;
	}

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
										/>
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
