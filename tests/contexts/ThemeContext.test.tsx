import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../../src/contexts/ThemeContext';

const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

const matchMediaMock = jest.fn();
Object.defineProperty(window, 'matchMedia', {
    value: matchMediaMock,
});

const TestComponent = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <div>
            <span data-testid="theme">{theme}</span>
            <button onClick={toggleTheme} data-testid="toggle">Toggle</button>
        </div>
    );
};

describe('ThemeContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        document.documentElement.className = '';
    });

    test('throws error when useTheme is used outside provider', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        expect(() => render(<TestComponent />)).toThrow(
            'useTheme must be used within a ThemeProvider'
        );
        consoleSpy.mockRestore();
    });

    test('provides default theme from localStorage', () => {
        localStorageMock.getItem.mockReturnValue('dark');
        matchMediaMock.mockReturnValue({ matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() });

        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        );

        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    test('provides default theme from media query when no localStorage', () => {
        localStorageMock.getItem.mockReturnValue(null);
        matchMediaMock.mockReturnValue({ matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn() });

        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        );

        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    test('provides light theme from media query when no localStorage and prefers light', () => {
        localStorageMock.getItem.mockReturnValue(null);
        matchMediaMock.mockReturnValue({ matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() });

        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        );

        expect(screen.getByTestId('theme')).toHaveTextContent('light');
        expect(document.documentElement.classList.contains('light')).toBe(true);
    });

    test('toggles theme from light to dark', () => {
        localStorageMock.getItem.mockReturnValue('light');
        matchMediaMock.mockReturnValue({ matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() });

        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        );

        const toggleButton = screen.getByTestId('toggle');
        fireEvent.click(toggleButton);

        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    test('toggles theme from dark to light', () => {
        localStorageMock.getItem.mockReturnValue('dark');
        matchMediaMock.mockReturnValue({ matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn() });

        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        );

        const toggleButton = screen.getByTestId('toggle');
        fireEvent.click(toggleButton);

        expect(screen.getByTestId('theme')).toHaveTextContent('light');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
        expect(document.documentElement.classList.contains('light')).toBe(true);
    });

    test('updates theme when media query changes and no saved theme', async () => {
        localStorageMock.getItem.mockReturnValue(null);
        const mediaQuery = { matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() };
        matchMediaMock.mockReturnValue(mediaQuery);

        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        );

        expect(screen.getByTestId('theme')).toHaveTextContent('light');

        mediaQuery.matches = true;
        const changeHandler = mediaQuery.addEventListener.mock.calls.find(call => call[0] === 'change')[1];
        changeHandler();

        await waitFor(() => {
            expect(screen.getByTestId('theme')).toHaveTextContent('dark');
        });
    });

    test('does not update theme when media query changes but saved theme exists', () => {
        localStorageMock.getItem.mockReturnValue('light');
        const mediaQuery = { matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn() };
        matchMediaMock.mockReturnValue(mediaQuery);

        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        );

        expect(screen.getByTestId('theme')).toHaveTextContent('light');

        const changeHandler = mediaQuery.addEventListener.mock.calls.find(call => call[0] === 'change')[1];
        changeHandler();

        expect(screen.getByTestId('theme')).toHaveTextContent('light');
    });

    test('removes old theme class and adds new one', () => {
        localStorageMock.getItem.mockReturnValue('light');
        matchMediaMock.mockReturnValue({ matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() });

        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        );

        expect(document.documentElement.classList.contains('light')).toBe(true);

        const toggleButton = screen.getByTestId('toggle');
        fireEvent.click(toggleButton);

        expect(document.documentElement.classList.contains('light')).toBe(false);
        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
});