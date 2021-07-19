module.exports = {
    clearMocks: true,
    verbose: true,
    roots: ['<rootDir>/src', '<rootDir>/test'],
    preset: "ts-jest",
    testRegex: '(.*\\.spec\\.)js$',
    testEnvironment: "node"
};