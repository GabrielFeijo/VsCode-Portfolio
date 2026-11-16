const fullCoverage = {
	branches: 100,
	functions: 100,
	lines: 100,
	statements: 100,
};

const interactiveCoverage = {
	branches: 90,
	functions: 100,
	lines: 100,
	statements: 95,
};

const fullyCoveredModules = [
	'src/app/components/keyboard-shortcuts-modal/keyboard-shortcuts-modal.tsx',
	'src/app/components/markdown-editor.tsx',
	'src/app/hooks/use-app-keyboard-shortcuts.ts',
	'src/app/pages/home.tsx',
	'src/services/api/axios-config/create-api-client.ts',
	'src/services/api/review/review-service.ts',
	'src/services/storage-service.ts',
];

const interactiveModules = [
	'src/app/components/md-container.tsx',
	'src/app/components/markdown-renderer.tsx',
	'src/app/components/terminal/cmd.tsx',
	'src/app/components/terminal/terminal/use-terminal.ts',
	'src/app/layout/app-tree.tsx',
	'src/app/layout/sidebar.tsx',
];

module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'jsdom',
	setupFilesAfterEnv: ['<rootDir>/tests/setup-tests.ts'],
	roots: ['<rootDir>/tests', '<rootDir>/src'],
	moduleNameMapper: {
		'.*project-files-glob.*': '<rootDir>/tests/mocks/project-files-glob.ts',
		'.*page-content-glob.*': '<rootDir>/tests/mocks/page-content-glob.ts',
		'.*style-content-glob.*': '<rootDir>/tests/mocks/style-content-glob.ts',
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
		'^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/style-mock.js',
		'^.+\\.(png|jpg|jpeg|webp|svg|gif)$': '<rootDir>/__mocks__/file-mock.js',
	},
	collectCoverage: true,
	collectCoverageFrom: [
		'src/**/*.{ts,tsx}',
		'!src/**/index.tsx',
		'!src/**/*.d.ts',
		'!src/services/api/axios-config/index.ts',
		'!src/services/terminal/project-files-glob.ts',
		'!src/services/page-content-glob.ts',
		'!src/services/style-content-glob.ts',
	],
	coverageDirectory: 'coverage',
	coverageThreshold: {
		global: {
			branches: 90,
			functions: 90,
			lines: 90,
			statements: 90,
		},
		...Object.fromEntries(fullyCoveredModules.map((modulePath) => [modulePath, fullCoverage])),
		...Object.fromEntries(
			interactiveModules.map((modulePath) => [modulePath, interactiveCoverage]),
		),
	},
};
