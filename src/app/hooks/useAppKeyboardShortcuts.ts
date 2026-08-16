import { useEffect } from 'react';

interface ShortcutActions {
	changeLanguage: () => void;
	navigateHome: () => void;
	toggleExplorer: () => void;
	toggleTerminal: () => void;
	toggleTheme: () => void;
	terminalEnabled: boolean;
}

export function useAppKeyboardShortcuts({
	changeLanguage,
	navigateHome,
	toggleExplorer,
	toggleTerminal,
	toggleTheme,
	terminalEnabled,
}: ShortcutActions) {
	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			const target = event.target as HTMLElement | null;
			if (
				target &&
				(target.tagName === 'INPUT' ||
					target.tagName === 'TEXTAREA' ||
					target.isContentEditable)
			) {
				return;
			}

			if (!event.ctrlKey) return;

			const actions: Partial<Record<string, () => void>> = {
				b: toggleExplorer,
				d: toggleTheme,
				h: navigateHome,
				l: changeLanguage,
			};

			if (terminalEnabled) actions.j = toggleTerminal;
			const action = actions[event.key.toLowerCase()];
			if (!action) return;

			event.preventDefault();
			action();
		}

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [
		changeLanguage,
		navigateHome,
		terminalEnabled,
		toggleExplorer,
		toggleTerminal,
		toggleTheme,
	]);
}
