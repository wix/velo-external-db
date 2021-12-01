module.exports = {
    clearMocks: true,
    verbose: true,
    roots: ['<rootDir>/lib', '<rootDir>/test'],
    preset: 'ts-jest',
    testRegex: '(.*\\.spec\\.)js$',
    testEnvironment: 'node'
}