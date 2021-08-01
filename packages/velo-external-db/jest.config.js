module.exports = {
    clearMocks: true,
    verbose: true,
    roots: ['<rootDir>/src', '<rootDir>/test'],
    preset: "ts-jest",
    testRegex: '(.*\\.spec\\.)js$',
    testEnvironment: "node",
    globalSetup: "./test/env/env.db.setup.js",
    globalTeardown: "./test/env/env.db.teardown.js",
};