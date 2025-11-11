export default {
    displayName: 'external-db-mysql',
    clearMocks: true,
    // roots: ['<rootDir>/src'],
    preset: '../../jest.preset.js',
    transform: {
      '^.+\\.[tj]s$': ['ts-jest', {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      }],
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../coverage/libs/external-db-mysql',
    testEnvironment: 'node'
}
