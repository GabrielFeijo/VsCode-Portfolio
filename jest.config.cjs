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
        '.*projectFilesGlob.*': '<rootDir>/tests/mocks/projectFilesGlob.ts',
        '.*pageContentGlob.*': '<rootDir>/tests/mocks/pageContentGlob.ts',
        '.*styleContentGlob.*': '<rootDir>/tests/mocks/styleContentGlob.ts',
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@app/(.*)$': '<rootDir>/src/app/$1',
        '^@components/(.*)$': '<rootDir>/src/app/components/$1',
        '^@layout/(.*)$': '<rootDir>/src/app/layout/$1',
        '^@pages/(.*)$': '<rootDir>/src/app/pages/$1',
        '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
        '^@contexts/(.*)$': '<rootDir>/src/contexts/$1',
        '^@services/(.*)$': '<rootDir>/src/services/$1',
        '^@utils/(.*)$': '<rootDir>/src/utils/$1',
        '^@domain/(.*)$': '<rootDir>/src/domain/$1',
        '^@config/(.*)$': '<rootDir>/src/config/$1',
        '^src/(.*)$': '<rootDir>/src/$1',
        '^nanoid$': '<rootDir>/__mocks__/nanoid.js',
        '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
        '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
        '^.+\\.(png|jpg|jpeg|svg|gif)$': '<rootDir>/__mocks__/fileMock.js'
    },
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/index.tsx',
        '!src/**/*.d.ts',
        '!src/services/api/axios-config/index.ts',
        '!src/services/terminal/projectFilesGlob.ts',
        '!src/services/pageContentGlob.ts',
        '!src/services/styleContentGlob.ts',
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
