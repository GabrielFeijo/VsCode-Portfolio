import React from 'react';

jest.mock('src/i18n', () => ({
    __esModule: true,
    default: {
        language: 'en',
        changeLanguage: jest.fn(),
    },
}));
jest.mock('src/theme.css');

const MockApp = () => <div data-testid="app" />;
MockApp.displayName = 'App';
jest.mock('src/app/layout/App', () => MockApp);

const MockThemeProvider = ({ children }: { children: React.ReactNode }) => <div data-testid="theme-provider">{children}</div>;
MockThemeProvider.displayName = 'ThemeProvider';
jest.mock('src/contexts/ThemeContext', () => ({
    ThemeProvider: MockThemeProvider,
}));

const MockBrowserRouter = ({ children }: { children: React.ReactNode }) => <div data-testid="browser-router">{children}</div>;
MockBrowserRouter.displayName = 'BrowserRouter';
jest.mock('react-router-dom', () => ({
    BrowserRouter: MockBrowserRouter,
}));

const MockHelmetProvider = ({ children }: { children: React.ReactNode }) => <div data-testid="helmet-provider">{children}</div>;
MockHelmetProvider.displayName = 'HelmetProvider';
jest.mock('react-helmet-async', () => ({
    HelmetProvider: MockHelmetProvider,
}));

const MockSpeedInsights = () => <div data-testid="speed-insights" />;
MockSpeedInsights.displayName = 'SpeedInsights';
jest.mock('@vercel/speed-insights/react', () => ({
    SpeedInsights: MockSpeedInsights,
}));

const mockGetElementById = jest.fn();
const mockRender = jest.fn();
const mockCreateRoot = jest.fn(() => ({ render: mockRender }));

Object.defineProperty(document, 'getElementById', {
    writable: true,
    value: mockGetElementById,
});

jest.mock('react-dom/client', () => ({
    createRoot: mockCreateRoot,
}));

describe('index.tsx', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetElementById.mockReturnValue(document.createElement('div'));
        jest.resetModules();
    });

    it('should create root and render the app with all providers', async () => {
        await import('../src/index');

        expect(mockGetElementById).toHaveBeenCalledWith('root');
        expect(mockCreateRoot).toHaveBeenCalledWith(mockGetElementById.mock.results[0].value);
        expect(mockRender).toHaveBeenCalledTimes(1);

        const renderArg = mockRender.mock.calls[0][0];

        expect(React.isValidElement(renderArg)).toBe(true);
    });

    it('should render with StrictMode', async () => {
        await import('../src/index');

        const renderArg = mockRender.mock.calls[0][0];
        expect(renderArg.type).toBe(React.StrictMode);
    });

    it('should include all providers in the correct order', async () => {
        await import('../src/index');

        const renderArg = mockRender.mock.calls[0][0];

        const strictModeChildren = renderArg.props.children;
        expect(strictModeChildren.type.displayName || strictModeChildren.type.name).toBe('HelmetProvider');

        const helmetChildren = strictModeChildren.props.children;
        expect(helmetChildren.type.displayName || helmetChildren.type.name).toBe('ThemeProvider');

        const themeChildren = helmetChildren.props.children;
        expect(themeChildren.type.displayName || themeChildren.type.name).toBe('BrowserRouter');

        const routerChildren = themeChildren.props.children;
        expect(routerChildren).toHaveLength(2);
        expect(routerChildren[0].type.displayName || routerChildren[0].type.name).toBe('SpeedInsights');
        expect(routerChildren[1].type.displayName || routerChildren[1].type.name).toBe('App');
    });
});