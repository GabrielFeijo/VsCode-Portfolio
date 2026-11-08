import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
	theme: Theme;
	toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'theme';
const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSavedTheme(): Theme | null {
	const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
	return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : null;
}

function getSystemTheme(): Theme {
	return window.matchMedia?.(DARK_SCHEME_QUERY).matches ? 'dark' : 'light';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [theme, setTheme] = useState<Theme>(() => getSavedTheme() ?? getSystemTheme());

	useEffect(() => {
		const root = window.document.documentElement;
		root.classList.remove('light', 'dark');
		root.classList.add(theme);
	}, [theme]);

	useEffect(() => {
		const mediaQuery = window.matchMedia(DARK_SCHEME_QUERY);
		const handleChange = () => {
			if (getSavedTheme() === null) {
				setTheme(mediaQuery.matches ? 'dark' : 'light');
			}
		};

		mediaQuery.addEventListener('change', handleChange);
		return () => mediaQuery.removeEventListener('change', handleChange);
	}, []);

	const toggleTheme = useCallback(() => {
		const nextTheme: Theme = theme === 'light' ? 'dark' : 'light';
		localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
		setTheme(nextTheme);
	}, [theme]);

	return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
};
