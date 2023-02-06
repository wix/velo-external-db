const { InvalidQuery } = require('@wix-velo/velo-external-db-commons').errors
import { unpackIdFieldForItem, validateTable, insertExpressionFor, isEmptyObject } from './mongo_utils'

describe('Mongo Utils', () => {
    describe('unpackIdFieldForItem', () => {
        test('Item with _id object field that contains _id field (Item._id._id) will return the object with _id field not as object', () => {
            const item = {
                _id: { _id: 1 },
                b: 2
            }
            expect(unpackIdFieldForItem(item)).toEqual({ _id: 1, b: 2 })
        })

        test('Item with _id object field that does not contains _id field will return the object without _id field', () => {
            const item = {
                _id: { a: 1 },
                b: 2
            }
            expect(unpackIdFieldForItem(item)).toEqual({ a: 1, b: 2 })
        })

        test('Item with _id field that is not an object will return as the same item', () => {
            const item = {
                _id: 1,
                b: 2
            }
            expect(unpackIdFieldForItem(item)).toEqual({ _id: 1, b: 2 })
        })

        test('Item without _id field will return as the same item', () => {
            const item = {
                a: 1,
                b: 2
            }
            expect(unpackIdFieldForItem(item)).toEqual({ a: 1, b: 2 })
        })
    })
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

    describe('insertExpressionFor', () => {
        test('insertExpressionFor with upsert set to false will return insert expression', () => {
            expect(insertExpressionFor([{ _id: 'itemId' }], false)[0]).toEqual({ insertOne: { document: { _id: 'itemId' } } })
        })
        test('insertExpressionFor with upsert set to true will return update expression', () => {
            expect(insertExpressionFor([{ _id: 'itemId' }], true)[0]).toEqual({
                                                                                updateOne: { 
                                                                                            filter: { _id: 'itemId' },
                                                                                            update: { $set: { _id: 'itemId' } },
                                                                                            upsert: true
                                                                                        } 
                                                                            })
        })
    })

    describe('isEmptyObject', () => {
        test('isEmptyObject will return true for empty object', () => {
            expect(isEmptyObject({})).toBe(true)
            expect(isEmptyObject({ a: {} }.a)).toBe(true)
        }
    )

    })
})
