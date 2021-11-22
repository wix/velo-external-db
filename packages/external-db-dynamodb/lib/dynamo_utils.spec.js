const { InvalidQuery } = require('velo-external-db-commons').errors
const { validateTable, canQuery, patchCollectionKeys } = require('./dynamo_utils')

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

    describe('Can Query', () => {
        test('return true when ExpressionAttributeNames include only _id', () => {
            const filterExpr = {
                FilterExpression: '#_id = :_id',
                ExpressionAttributeNames: { '#_id': '_id' },
                ExpressionAttributeValues: { ':_id': 'some-id' }
            }
            expect(canQuery(filterExpr, patchCollectionKeys())).toBeTruthy()
        })

        test('return false when ExpressionAttributeNames include another attributes but keys', () => {
            const filterExpr = {
                FilterExpression: '#_id = :_id, #attr = :attr',
                ExpressionAttributeNames: { '#_id': '_id', '#attr': 'attr' },
                ExpressionAttributeValues: { ':_id': 'some-id', ':attr': 'value' }
            }
            expect(canQuery(filterExpr, patchCollectionKeys())).toBeFalsy()
        })
    })
})