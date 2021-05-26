module.exports = {
    clearMocks: true,
    verbose: true,
    roots: ['<rootDir>/src'],
    preset: "ts-jest",
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.js?$',
    testEnvironment: "node"
};