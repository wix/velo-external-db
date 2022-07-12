export default {
    displayName: 'external-db-config',
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
    coverageDirectory: '../../coverage/libs/velo-external-db-commons',
    clearMocks: true,
    verbose: true,
    // testRegex: '(.*\\.spec\\.)js$',
  };
  