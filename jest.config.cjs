const fullCoverage = {
    branches: 100,
    functions: 100,
    lines: 100,
    statements: 100
};

const interactiveCoverage = {
    branches: 90,
    functions: 100,
    lines: 100,
    statements: 95
};

const fullyCoveredModules = [
    'src/app/components/KeyboardShortcutsModal/KeyboardShortcutsModal.tsx',
    'src/app/components/MarkdownEditor.tsx',
    'src/app/hooks/useAppKeyboardShortcuts.ts',
    'src/app/pages/Home.tsx',
    'src/services/api/axios-config/createApiClient.ts',
    'src/services/api/review/ReviewService.ts',
    'src/services/storageService.ts',
];

const interactiveModules = [
    'src/app/components/MDContainer.tsx',
    'src/app/components/MarkdownRenderer.tsx',
    'src/app/components/Terminal/Cmd.tsx',
    'src/app/components/Terminal/terminal/useTerminal.ts',
    'src/app/layout/AppTree.tsx',
    'src/app/layout/Sidebar.tsx',
];

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
    roots: ['<rootDir>/tests', '<rootDir>/src'],
    moduleNameMapper: {
        // Browser-only Vite import.meta.glob module, never executed in tests.
        '^./projectFilesGlob$': '<rootDir>/tests/mocks/projectFilesGlob.ts',
        '^src/(.*)$': '<rootDir>/src/$1',
        '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
        '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
        '^.+\\.(png|jpg|jpeg|svg|gif)$': '<rootDir>/__mocks__/fileMock.js'
    },
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/index.tsx',
        '!src/**/*.d.ts',
        // Vite composition root: its client factory is covered directly below.
        '!src/services/api/axios-config/index.ts',
        // Browser-only import.meta.glob glue, not executable in Jest.
        '!src/services/terminal/projectFilesGlob.ts',
    ],
    coverageDirectory: 'coverage',
    coverageThreshold: {
        global: {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90
        },
        ...Object.fromEntries(
            fullyCoveredModules.map((modulePath) => [modulePath, fullCoverage])
        ),
        ...Object.fromEntries(
            interactiveModules.map((modulePath) => [modulePath, interactiveCoverage])
        ),
    }
};
