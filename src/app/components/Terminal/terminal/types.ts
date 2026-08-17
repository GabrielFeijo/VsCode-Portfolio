import { Language } from '@/domain/page';

export interface TerminalEntry {
	id: string;
	command: string;
	response: string[];
	color?: string;
	cwd: string;
}

export interface VirtualFileEntry {
	name: string;
	type: 'file' | 'dir';
	content?: string[];
}

export type VirtualDirectory = Record<string, VirtualFileEntry[]>;

export interface UseTerminalOptions {
	language: Language;
	setRanking: React.Dispatch<React.SetStateAction<boolean>>;
	changeLanguage: () => void;
}

export interface CompletionState {
	value: string | null;
	candidates: string[];
	list: string[];
	isPath: boolean;
}

export interface ActiveEditorSession {
	fileName: string;
	filePath: string;
	initialContent: string;
}
