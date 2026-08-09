module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
    roots: ['<rootDir>/tests', '<rootDir>/src'],
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
        '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
        '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
        '^.+\\.(png|jpg|jpeg|svg|gif)$': '<rootDir>/__mocks__/fileMock.js'
    },
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/index.tsx',
        '!src/vite-env.d.ts',
        // Vite composition root: its client factory is covered directly below.
        '!src/services/api/axios-config/index.ts',
    ],
    coverageDirectory: 'coverage',
    coverageThreshold: {
        global: {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90
        },
        'src/services/api/axios-config/createApiClient.ts': {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100
        },
    }
};
