module.exports = {
    clearMocks: true,
    verbose: true,
    roots: ['<rootDir>/src'],
    testRegex: '(.*\\.spec\\.)js$',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['jest-extended/all'],
}