module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
    roots: ['<rootDir>/tests'],
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
        '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
        '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
        '^.+\\.(png|jpg|jpeg|svg|gif)$': '<rootDir>/__mocks__/fileMock.js'
    },
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/index.tsx', '!src/vite-env.d.ts'],
    coverageDirectory: 'coverage',
    coverageThreshold: {
        global: {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90
        },
        'src/app/components/': {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90
        },
        'src/app/utils/': {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90
        },
    }
};
