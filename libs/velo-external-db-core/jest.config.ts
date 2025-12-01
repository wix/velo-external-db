export default {
    displayName: 'velo-external-db-core',
    clearMocks: true,
    roots: ['<rootDir>/src'],
    testEnvironment: 'node',
    preset: '../../jest.preset.js',
    transform: {
      '^.+\\.[tj]s$': ['ts-jest', {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      }],
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../coverage/libs/velo-external-db-core',
    setupFilesAfterEnv: ['jest-extended/all'],
}
