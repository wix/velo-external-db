export default {
    displayName: 'velo-external-db',
    preset: '../../jest.preset.js',
    clearMocks: true,
    verbose: true,
    roots: ['<rootDir>/src', '<rootDir>/test'],
    globals: {
        'ts-jest': {
          tsconfig: '<rootDir>/tsconfig.spec.json',
        },
    },    
    // testRegex: '(.*\\.spec\\.)js$',
    testEnvironment: 'node',
    transform: {
        '^.+\\.[tj]s$': 'ts-jest',
    },
    globalSetup: './test/env/env.db.setup.js',
    globalTeardown: './test/env/env.db.teardown.js',
    testTimeout: 20000,
    moduleFileExtensions: ['ts', 'js', 'html'],
    setupFilesAfterEnv: ['jest-extended/all'],
    coverageDirectory: '../../coverage/apps/ex-db-template',
    maxWorkers: 1,
}
