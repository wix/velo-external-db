/* eslint-disable */
export default {
    displayName: 'external-db-google-sheets',
    clearMocks: true,
    verbose: true,
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
    coverageDirectory: '../../coverage/libs/external-db-google-sheets',
    testEnvironment: 'node'
}