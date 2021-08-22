const { testLiteral, validateLiteral } = require('./spanner_utils')
const { InvalidQuery } = require('velo-external-db-commons').errors
const each = require('jest-each').default
const Chance = require('chance')
const chance = Chance()

describe('escape literal', () => {

    test('allows lower case', () => {
        expect(testLiteral(chance.word().toLowerCase())).toBeTruthy()
    })

    test('allows upper case', () => {
        expect(testLiteral(chance.word().toUpperCase())).toBeTruthy()
    })

    test('allows digits', () => {
        expect(testLiteral(`${chance.integer({ min: 1 })}`)).toBeTruthy()
    })

    test('allows underscore', () => {
        expect(testLiteral(`_${chance.word()}`)).toBeTruthy()
        expect(testLiteral(`${chance.word()}_`)).toBeTruthy()
        expect(testLiteral(`${chance.word()}_${chance.word()}`)).toBeTruthy()
    })

    each([
        ...`~! @#$%^&*()+-=[]\{}|;:'",./<>?`
    ]).test(`does not allow special characters [%s]`, (ch) => {
        expect(testLiteral(`${ch}`)).toBeFalsy()
    })

    test('validateLiteral will return identifier with @ prefix if its valid', () => {
        const literal = chance.word()
        expect(validateLiteral(literal)).toEqual(`@${literal}`)
    })

    test('validateLiteral will throw for invalid literal', () => {
        expect(() => validateLiteral(`~! @#$%^&*()+-=[]\{}|;:'",./<>?`)).toThrow(InvalidQuery)
    })
})