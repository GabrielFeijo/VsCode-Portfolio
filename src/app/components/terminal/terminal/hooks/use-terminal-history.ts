import { useCallback, useRef, useState } from 'react';

export function useTerminalHistory() {
	const [history, setHistory] = useState<string[]>([]);
	const historyRef = useRef<string[]>([]);
	const [historyIndex, setHistoryIndex] = useState(-1);

	const addToHistory = useCallback((rawCommand: string) => {
		const trimmed = rawCommand.trim();
		if (trimmed.length <= 1) return;

		setHistory((prev) => {
			const next = [...prev.filter((h) => h !== trimmed), trimmed];
			historyRef.current = next;
			return next;
		});
		setHistoryIndex(-1);
	}, []);

	const navigateUp = useCallback((): string | null => {
		const currentHistory = historyRef.current;
		if (currentHistory.length === 0) return null;

		const newIndex = historyIndex < 0 ? currentHistory.length - 1 : Math.max(0, historyIndex - 1);
		setHistoryIndex(newIndex);
		return currentHistory[newIndex];
	}, [historyIndex]);

	const navigateDown = useCallback((): string | null => {
		const currentHistory = historyRef.current;
		if (historyIndex < 0) return null;

		const newIndex = historyIndex + 1;
		if (newIndex >= currentHistory.length) {
			setHistoryIndex(-1);
			return '';
		}
		setHistoryIndex(newIndex);
		return currentHistory[newIndex];
	}, [historyIndex]);

	const resetIndex = useCallback(() => {
		setHistoryIndex(-1);
	}, []);

	return {
		history,
		historyRef,
		historyIndex,
		addToHistory,
		navigateUp,
		navigateDown,
		resetIndex,
	};
}
