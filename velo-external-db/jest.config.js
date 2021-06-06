module.exports = {
    clearMocks: true,
    verbose: true,
    roots: ['<rootDir>/src', '<rootDir>/test'],
    preset: "ts-jest",
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.js?$',
    testEnvironment: "node"
};