
module.exports = {
    clearMocks: true,
    verbose: true,
    roots: ['<rootDir>/lib'],
    preset: 'ts-jest',
    testRegex: '(.*\\.spec\\.)js$',
    testEnvironment: 'node'
}