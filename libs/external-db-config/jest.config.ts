export default {
    displayName: 'external-db-config',
    preset: '../../jest.preset.js',
    transform: {
      '^.+\\.[tj]s$': ['ts-jest', {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      }],
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../coverage/libs/velo-external-db-commons',
    clearMocks: true,
    // testRegex: '(.*\\.spec\\.)js$',
  }
  
