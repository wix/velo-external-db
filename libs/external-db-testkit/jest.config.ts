export default {
  displayName: 'external-db-mongo',
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
  coverageDirectory: '../../coverage/libs/external-db-mongo',
  testEnvironment: 'node'
}