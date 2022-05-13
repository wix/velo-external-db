module.exports = {
    clearMocks: true,
    verbose: true,
    roots: ['<rootDir>/src', '<rootDir>/test'],
    testRegex: '(.*\\.spec\\.)js$',
    testEnvironment: 'node',
    globalSetup: './test/env/env.db.setup.js',
    globalTeardown: './test/env/env.db.teardown.js',
    testTimeout: 20000,
    setupFilesAfterEnv: ['jest-extended/all']
}