import { useState, useRef, useEffect, useCallback } from 'react';
import { Page } from '../../domain/page';
import { StorageService } from '../../services/storageService';
import { normalizeFileName } from '../../utils/normalizeFileName';
import { stripFileExtension } from '../../utils/stripFileExtension';

interface UseFileCreationParams {
	pages: Page[];
	setPages: React.Dispatch<React.SetStateAction<Page[]>>;
	openFile: (page: Page) => void;
}

export function useFileCreation({
	pages,
	setPages,
	openFile,
}: UseFileCreationParams) {
	const [isCreatingFile, setIsCreatingFile] = useState(false);
	const [newFileName, setNewFileName] = useState('');
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (isCreatingFile && fileInputRef.current) {
			fileInputRef.current.focus();
		}
	}, [isCreatingFile]);

	const resetFileCreationState = useCallback(() => {
		setIsCreatingFile(false);
		setNewFileName('');
	}, []);

	const createNewFile = useCallback((overrideName?: string) => {
		const rawName = (overrideName ?? newFileName).trim();
		if (rawName === '') {
			resetFileCreationState();
			return;
		}

		const baseName = stripFileExtension(rawName);
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
	}, [newFileName, pages, setPages, openFile, resetFileCreationState]);

	const handleCreateFile = useCallback((e: React.MouseEvent) => {
		e.stopPropagation();
		setIsCreatingFile(true);
	}, []);

	const handleConfirmCreateFile = useCallback((e?: React.MouseEvent) => {
		e?.stopPropagation();
		createNewFile();
	}, [createNewFile]);

	const handleCancelCreateFile = useCallback((e?: React.MouseEvent) => {
		e?.stopPropagation();
		resetFileCreationState();
	}, [resetFileCreationState]);

	const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
		e.stopPropagation();
		if (e.key === 'Enter') {
			e.preventDefault();
			createNewFile();
		} else if (e.key === 'Escape') {
			e.preventDefault();
			resetFileCreationState();
		}
	}, [createNewFile, resetFileCreationState]);

	return {
		isCreatingFile,
		newFileName,
		setNewFileName,
		fileInputRef,
		handleCreateFile,
		handleConfirmCreateFile,
		handleCancelCreateFile,
		handleKeyDown,
	};
}
