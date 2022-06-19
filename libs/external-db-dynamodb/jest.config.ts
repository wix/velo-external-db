module.exports = {
    displayName: 'external-db-dynamodb',
    clearMocks: true,
    verbose: true,
    // roots: ['<rootDir>/src'],
    // testRegex: '(.*\\.spec\\.)js$',
    preset: '../../jest.preset.js',
    globals: {
      'ts-jest': {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    },
    transform: {
      '^.+\\.[tj]s$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../coverage/libs/external-db-dynamodb',
    testEnvironment: 'node'
}