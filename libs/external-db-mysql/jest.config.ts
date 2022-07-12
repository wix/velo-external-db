export default {
    displayName: 'external-db-mysql',
    clearMocks: true,
    verbose: true,
    // roots: ['<rootDir>/src'],
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
    coverageDirectory: '../../coverage/libs/external-db-mysql',
    testEnvironment: 'node'
}