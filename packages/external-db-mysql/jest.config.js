module.exports = {
    clearMocks: true,
    verbose: true,
    roots: ['<rootDir>/lib'],
    preset: "ts-jest",
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.js?$',
    testEnvironment: "node"
};