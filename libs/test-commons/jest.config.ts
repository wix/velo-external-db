/* eslint-disable */
export default {
  testMatch: ["**/test/it/**/*.spec.ts"],
  displayName: 'test-commons',
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
  coverageDirectory: '../../coverage/libs/test-commons',
  verbose: true,
};
