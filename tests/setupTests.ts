import '@testing-library/jest-dom';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: any, opts?: any) => (opts && opts.returnObjects ? [] : k) }),
    Trans: ({ children }: any) => children,
}));

jest.mock('react-router-dom', () => {
    const actual = jest.requireActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => jest.fn(),
    };
});

jest.mock('../src/contexts/ThemeContext', () => ({
    useTheme: jest.fn(),
}));

const { useTheme } = require('../src/contexts/ThemeContext');
useTheme.mockReturnValue({ theme: 'light', toggleTheme: jest.fn() });

global.fetch = (global.fetch as any) || jest.fn(() => Promise.resolve({ text: () => Promise.resolve('# hello') }));

(global as any).import = {
    meta: {
        env: {
            VITE_NAME: 'Test App',
        },
    },
};
