const { InvalidQuery } = require('@wix-velo/velo-external-db-commons').errors
const { validateTable } = require('./dynamo_utils')

describe('Dynamo Utils', () => {
    describe('validateTable', () => {
        test('validateTable will not allow systemTable', () => {
            expect(() => validateTable('_descriptor')).toThrow(InvalidQuery)
        })

        test('validateTable will not allow variation of systemTable', () => {
            expect(() => validateTable('_dEscRiptoR')).toThrow()
        })

        test('validateTable will not throw with valid table name', () => {
            expect(() => validateTable('someTable')).not.toThrow()
        })
    })

})