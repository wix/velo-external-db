module.exports = {
    displayName: 'velo-external-db-core',
    clearMocks: true,
    verbose: true,
    roots: ['<rootDir>/src'],
    // testRegex: '(.*\\.spec\\.)js$',
    // testEnvironment: 'node',
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
    coverageDirectory: '../../coverage/libs/velo-external-db-core',
    // setupFilesAfterEnv: ['jest-extended/all'],
}