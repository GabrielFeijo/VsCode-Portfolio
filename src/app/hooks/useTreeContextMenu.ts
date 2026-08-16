import { useState, useCallback } from 'react';
import { Language, Page } from '../../domain/page';
import { StorageService } from '../../services/storageService';
import { siteConfig } from '../../config/site';
import { getLocalizedPath } from '../../config/seo';
import { NavigateFunction } from 'react-router-dom';

interface UseTreeContextMenuParams {
	pages: Page[];
	setPages: React.Dispatch<React.SetStateAction<Page[]>>;
	setVisiblePageIndexes: React.Dispatch<React.SetStateAction<number[]>>;
	setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
	navigate: NavigateFunction;
	language: Language;
	openFile: (page: Page) => void;
}

export function useTreeContextMenu({
	pages,
	setPages,
	setVisiblePageIndexes,
	setSelectedIndex,
	navigate,
	language,
	openFile,
}: UseTreeContextMenuParams) {
	const [contextMenu, setContextMenu] = useState<{
		mouseX: number;
		mouseY: number;
		pageIndex: number | null;
	} | null>(null);

	const handleContextMenu = useCallback((event: React.MouseEvent, index: number) => {
		event.preventDefault();
		setContextMenu((prev) =>
			prev === null
				? {
					mouseX: event.clientX - 2,
					mouseY: event.clientY - 4,
					pageIndex: index,
				}
				: null
		);
	}, []);

	const handleClose = useCallback(() => {
		setContextMenu(null);
	}, []);

	const handleDelete = useCallback(() => {
		if (contextMenu?.pageIndex === null || contextMenu?.pageIndex === undefined) return;
		const pageIndex = contextMenu.pageIndex;
		setPages((prev) => prev.filter((x) => x.index !== pageIndex));
		setVisiblePageIndexes((prev) => prev.filter((x) => x !== pageIndex));
		StorageService.deleteFile(pageIndex);
		setSelectedIndex(0);
		navigate(getLocalizedPath('/about-me', language));
		handleClose();
	}, [contextMenu, handleClose, language, navigate, setPages, setSelectedIndex, setVisiblePageIndexes]);

	const handleOpenFile = useCallback(() => {
		if (contextMenu?.pageIndex === null || contextMenu?.pageIndex === undefined) return;
		const existingPage = pages.find((x) => x.index === contextMenu.pageIndex);
		if (!existingPage) return;
		openFile(existingPage);
		handleClose();
	}, [contextMenu, openFile, handleClose, pages]);

	const handleOpenFileOnGithub = useCallback(() => {
		if (contextMenu?.pageIndex === null || contextMenu?.pageIndex === undefined) return;
		const existingPage = pages.find((x) => x.index === contextMenu.pageIndex);
		if (!existingPage) return;
		window.open(
			`${siteConfig.repoUrl}/tree/main/src/pages/${language}/${existingPage.name}`,
			'_blank',
			'noopener,noreferrer'
		);
		handleClose();
	}, [contextMenu, handleClose, language, pages]);

	return {
		contextMenu,
		handleContextMenu,
		handleClose,
		handleDelete,
		handleOpenFile,
		handleOpenFileOnGithub,
	};
}
