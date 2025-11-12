export default {
    displayName: 'external-db-airtable',
    clearMocks: true,
    // roots: ['<rootDir>/src'],
    // testRegex: '(.*\\.spec\\.)js$',
    preset: '../../jest.preset.js',
    transform: {
      '^.+\\.[tj]s$': ['ts-jest', {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      }],
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../coverage/libs/external-db-airtable',
    testEnvironment: 'node'
}
