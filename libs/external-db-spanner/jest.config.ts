export default {
    displayName: 'external-db-spanner',
    clearMocks: true,
    preset: '../../jest.preset.js',
    transform: {
      '^.+\\.[tj]s$': ['ts-jest', {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      }],
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../coverage/libs/external-db-spanner',
    testEnvironment: 'node'
}
