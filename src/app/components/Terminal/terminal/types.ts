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

export interface TerminalColors {
	user: string;
	host: string;
	path: string;
	git: string;
	arrow: string;
	muted: string;
	text: string;
	bg: string;
	error: string;
	success: string;
	warning: string;
	info: string;
	link: string;
}

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
