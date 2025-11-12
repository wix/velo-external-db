/* eslint-disable */
export default {
    displayName: 'external-db-google-sheets',
    clearMocks: true,
    preset: '../../jest.preset.js',
    transform: {
      '^.+\\.[tj]s$': ['ts-jest', {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      }],
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../coverage/libs/external-db-google-sheets',
    testEnvironment: 'node'
}