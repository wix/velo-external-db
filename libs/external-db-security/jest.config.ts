export default {
    displayName: 'external-db-security',
    clearMocks: true,
    preset: '../../jest.preset.js',
    transform: {
      '^.+\\.[tj]s$': ['ts-jest', {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      }],
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../coverage/libs/external-db-security',
    // testRegex: '(.*\\.spec\\.)js$',
    // roots: ['<rootDir>/src'],
    // testRegex: '(.*\\.spec\\.)js$',
    // testEnvironment: 'node',
}
  
