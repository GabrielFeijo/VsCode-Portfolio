import { nanoid } from 'nanoid';
import { useCallback, useState } from 'react';
import { TerminalEntry } from '../types';

export function useTerminalEntries(cwd: string) {
	const [entries, setEntries] = useState<TerminalEntry[]>([]);

	const addEntry = useCallback(
		(cmd: string, response: string[], color?: string, entryCwd = cwd) => {
			setEntries((prev) => [
				...prev,
				{ id: nanoid(), command: cmd, response, color, cwd: entryCwd },
			]);
		},
		[cwd],
	);

	const clearEntries = useCallback(() => {
		setEntries([]);
	}, []);

	return { entries, addEntry, clearEntries };
}
