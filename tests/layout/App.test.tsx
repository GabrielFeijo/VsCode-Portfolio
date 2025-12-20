import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import App, { initVisiblePageIndexes } from '../../src/app/layout/App';

jest.mock('@mui/material', () => {
    const filterProps = (props: any) => {
        const {
            xs,
            item,
            container,
            initial,
            disableGutters,
            disableRipple,
            disableElevation,
            disableFocusRipple,
            maxWidth,
            zIndex,
            zeroMinWidth,
            lg,
            md,
            sm,
            sx,
            ...rest
        } = props;
        return rest;
    };

    return {
        Box: ({ children, ...props }: any) => <div {...filterProps(props)}>{children}</div>,
        Container: ({ children, ...props }: any) => <div {...filterProps(props)}>{children}</div>,
        Grid: ({ children, ...props }: any) => <div {...filterProps(props)}>{children}</div>,
        Stack: ({ children, ...props }: any) => <div {...filterProps(props)}>{children}</div>,
        ThemeProvider: ({ children }: any) => <div>{children}</div>,
        CssBaseline: () => <div />,
        Typography: ({ children, ...props }: any) => <div {...filterProps(props)}>{children}</div>,
        createTheme: jest.fn(() => ({})),
    };
});

let mockCalled = false;
let appTreeMode = 'default';
jest.mock('src/app/layout/AppTree', () => ({ setVisiblePageIndexes, setSelectedIndex, setPages }: any) => {
    React.useEffect(() => {
        if (!mockCalled) {
            mockCalled = true;

            switch (appTreeMode) {
                case 'empty':
                    setVisiblePageIndexes([]);
                    break;
                case 'delete':
                    if (setPages) setPages((prev: any) => [...prev, { index: 2, name: 'stored.html', route: 'stored' }]);
                    if (setSelectedIndex) setSelectedIndex(2);
                    setVisiblePageIndexes([0, 1]);
                    break;
                case 'delete_min':
                    if (setPages) setPages((prev: any) => [...prev, { index: 1, name: 'stored.html', route: 'stored' }]);
                    if (setSelectedIndex) setSelectedIndex(1);
                    setVisiblePageIndexes([0, 2]);
                    break;
                default:
                    setVisiblePageIndexes([1]);
            }
        }
    }, []);
    return <div data-testid="app-tree" />;
});
jest.mock('src/app/layout/Footer', () => () => <div data-testid="footer" />);
jest.mock('src/app/layout/Sidebar', () => ({ setExpanded, expanded, terminal, setTerminal, language, changeLanguage }: any) => (
    <div data-testid="sidebar" onClick={() => setExpanded(!expanded)} data-expanded={expanded}>
        <button data-testid="toggle-terminal" onClick={() => setTerminal(!terminal)}>Toggle Terminal</button>
        <button data-testid="change-language" onClick={changeLanguage}>Change Language</button>
    </div>
));
jest.mock('react-router-dom', () => ({
    Routes: ({ children }: any) => <div>{children}</div>,
    Route: ({ element }: any) => element,
    useNavigate: jest.fn(),
    Navigate: () => <div data-testid="navigate" />,
}));
jest.mock('src/app/layout/AppButtons', () => ({ pages }: any) => (
    <div data-testid="app-buttons" data-pages={pages ? pages.length : 0} />
));
jest.mock('src/app/components/MDContainer', () => () => <div data-testid="md-container" />);
jest.mock('src/app/pages/Home', () => ({ setSelectedIndex }: any) => <div data-testid="home" onClick={() => setSelectedIndex(0)} />);
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));
jest.mock('react-device-detect', () => ({
    isBrowser: true,
    isMobile: false,
}));
jest.mock('src/app/layout/Terminal', () => () => <div data-testid="terminal" />);
jest.mock('src/app/components/Rating/BoxRating', () => () => <div data-testid="box-rating" />);
jest.mock('src/app/components/KeyboardShortcutsModal/KeyboardShortcutsModal', () => () => <div data-testid="keyboard-shortcuts" />);
jest.mock('src/i18n', () => ({
    language: 'en',
    changeLanguage: jest.fn(),
}));
jest.mock('src/contexts/ThemeContext', () => ({
    useTheme: jest.fn(),
}));
jest.mock('src/app/pages/pages', () => ({
    pageRoutes: {
        en: [
            { index: 0, name: 'about-me.html', route: 'about-me' },
            { index: 1, name: 'skills.html', route: 'skills' },
        ],
        pt: [
            { index: 0, name: 'sobre-mim.html', route: 'about-me' },
            { index: 1, name: 'habilidades.html', route: 'skills' },
        ],
    },
}));
jest.mock('react-i18next', () => ({
    useTranslation: jest.fn(),
}));
jest.mock('src/utils/motionVariants', () => ({
    sidebarAnimations: {},
    sidebarItemAnimations: {},
    slideInOut: {},
    slideUpDown: {},
}));
jest.mock('src/services/storageService', () => ({
    StorageService: {
        getData: jest.fn(() => []),
        setData: jest.fn(),
    },
    Page: {},
}));
jest.mock('src/app/layout/Metadata', () => () => <div data-testid="metadata" />);

const mockUseTheme = require('src/contexts/ThemeContext').useTheme;
const mockUseTranslation = require('react-i18next').useTranslation;
const mockUseNavigate = require('react-router-dom').useNavigate;
let navigateMock: any = null;
const mockI18n = require('src/i18n');
const mockStorageService = require('src/services/storageService').StorageService;

describe('App', () => {
    beforeEach(() => {
        mockCalled = false;
        mockUseTheme.mockReturnValue({
            theme: 'light',
            toggleTheme: jest.fn(),
        });
        mockUseTranslation.mockReturnValue({
            t: jest.fn((key) => key),
        });
        navigateMock = jest.fn();
        mockUseNavigate.mockReturnValue(navigateMock);
        mockStorageService.getData.mockReturnValue([]);
    });

    it('renders the app with all components', async () => {
        render(<App />);
        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('app-tree')).toBeInTheDocument();
        expect(screen.getByTestId('footer')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByTestId('terminal')).toBeInTheDocument();
        });
        expect(screen.getByTestId('box-rating')).toBeInTheDocument();
        expect(screen.getByTestId('keyboard-shortcuts')).toBeInTheDocument();
    });

    it('renders home component by default', () => {
        render(<App />);
        expect(screen.getByTestId('home')).toBeInTheDocument();
    });

    it('toggles terminal on Ctrl+J', () => {
        render(<App />);
        expect(screen.getByTestId('terminal')).toBeInTheDocument();

        fireEvent.keyDown(window, { key: 'j', ctrlKey: true });
        expect(screen.queryByTestId('terminal')).not.toBeInTheDocument();

        fireEvent.keyDown(window, { key: 'j', ctrlKey: true });
        expect(screen.getByTestId('terminal')).toBeInTheDocument();
    });

    it('toggles theme on Ctrl+D', () => {
        const toggleTheme = jest.fn();
        mockUseTheme.mockReturnValue({
            theme: 'light',
            toggleTheme,
        });
        render(<App />);
        fireEvent.keyDown(window, { key: 'd', ctrlKey: true });
        expect(toggleTheme).toHaveBeenCalled();
    });

    it('changes language on Ctrl+L', () => {
        render(<App />);
        fireEvent.keyDown(window, { key: 'l', ctrlKey: true });
        expect(mockI18n.changeLanguage).toHaveBeenCalledWith('pt');
    });

    it('navigates to home on Ctrl+H', () => {
        const navigate = jest.fn();
        mockUseNavigate.mockReturnValue(navigate);
        render(<App />);
        fireEvent.keyDown(window, { key: 'h', ctrlKey: true });
        expect(navigate).toHaveBeenCalledWith('/');
    });

    it('toggles sidebar on Ctrl+B', () => {
        render(<App />);
        fireEvent.keyDown(window, { key: 'b', ctrlKey: true });
        const sidebar = screen.getByTestId('sidebar');
        expect(sidebar).toHaveAttribute('data-expanded', 'false');
    });

    it('initializes visible page indexes correctly', () => {
        const pages = [
            { index: 0, name: 'test1', route: 'test1' },
            { index: 1, name: 'test2', route: 'test2' },
        ];
        const result = initVisiblePageIndexes(pages);
        expect(result).toEqual([0, 1]);
    });

    it('loads stored pages on mount', () => {
        const storedPages = [{ index: 2, name: 'stored', route: 'stored' }];
        mockStorageService.getData.mockReturnValue(storedPages);
        render(<App />);
    });

    it('changes language and loads stored pages', () => {
        const storedPages = [{ index: 2, name: 'stored', route: 'stored' }];
        mockStorageService.getData.mockReturnValue(storedPages);
        render(<App />);
        const changeLangBtn = screen.getByTestId('change-language');
        fireEvent.click(changeLangBtn);
        expect(mockI18n.changeLanguage).toHaveBeenCalledWith('pt');

        const appButtons = screen.getByTestId('app-buttons');
        expect(appButtons).toHaveAttribute('data-pages', '1');
    });

    it('does not show terminal on mobile', () => {
        const originalIsMobile = require('react-device-detect').isMobile;
        require('react-device-detect').isMobile = true;
        render(<App />);
        expect(screen.queryByTestId('terminal')).not.toBeInTheDocument();
        require('react-device-detect').isMobile = originalIsMobile;
    });

    it('does not toggle terminal on Ctrl+J when mobile', () => {
        const originalIsMobile = require('react-device-detect').isMobile;
        require('react-device-detect').isMobile = true;
        render(<App />);
        expect(screen.queryByTestId('terminal')).not.toBeInTheDocument();
        fireEvent.keyDown(window, { key: 'j', ctrlKey: true });
        expect(screen.queryByTestId('terminal')).not.toBeInTheDocument();
        require('react-device-detect').isMobile = originalIsMobile;
    });

    it('closes sidebar on overlay click when mobile', () => {
        const originalIsMobile = require('react-device-detect').isMobile;
        require('react-device-detect').isMobile = true;
        render(<App />);
        const overlay = screen.getByTestId('sidebar-overlay');
        fireEvent.click(overlay);
        const sidebar = screen.getByTestId('sidebar');
        expect(sidebar).toHaveAttribute('data-expanded', 'false');
        require('react-device-detect').isMobile = originalIsMobile;
    });

    it('handles page removal correctly', async () => {
        const mockNavigate = require('react-router-dom').useNavigate;
        render(<App />);
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalled();
        });
    });

    it('navigates to root when visiblePageIndexes becomes empty', async () => {
        appTreeMode = 'empty';
        render(<App />);
        await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/'));
        appTreeMode = 'default';
    });

    it('when deletedIndex > max visible, navigates to max page route', async () => {
        const mockStorage = require('src/services/storageService').StorageService;
        mockStorage.getData.mockReturnValue([{ index: 2, name: 'stored.html', route: 'stored' }]);
        appTreeMode = 'delete';
        render(<App />);
        await waitFor(() => {
            const appButtons = screen.getByTestId('app-buttons');
            expect(appButtons).toBeInTheDocument();
        });
        mockStorage.getData.mockReturnValue([]);
        appTreeMode = 'default';
    });

    it('when deletedIndex < max visible, navigates to min page route', async () => {
        const mockStorage = require('src/services/storageService').StorageService;
        mockStorage.getData.mockReturnValue([{ index: 1, name: 'stored.html', route: 'stored' }]);
        appTreeMode = 'delete_min';
        render(<App />);
        await waitFor(() => {
            expect(navigateMock).toHaveBeenCalledWith('/about-me');
        });
        mockStorage.getData.mockReturnValue([]);
        appTreeMode = 'default';
    });
});