const { Uninitialized } = require('@wix-velo/test-commons')
const { extractFieldsAndOperators, queryAdapterOperatorsFor } = require ('./query_validator_utils')
const { AdapterOperators } = require('@wix-velo/velo-external-db-commons')
const { eq, gt, gte, include, lt, lte, ne, string_begins, string_ends, string_contains, and, matches } = AdapterOperators
const { EmptyFilter } = require('./utils')
const gen = require('../../test/gen')
const Chance = require('chance')
const chance = Chance()

describe('Query Validator utils spec', () => {
    describe('extractFieldsAndOperators', () => {
        test('should return empty array when called with empty filter', () => {
            expect(extractFieldsAndOperators(EmptyFilter)).toEqual([])
        })
        
        test('correctly extract fields and operators with single field filter', () => {
            expect(extractFieldsAndOperators({
                                                fieldName: ctx.fieldName, 
                                                operator: ctx.operator,
                                                value: ctx.value
                                            })
                 ).toEqual([{ name: ctx.fieldName, operator: ctx.operator }])        
        })

        test('correctly extract fields and operators with multiple fields filter', () => {
            expect(extractFieldsAndOperators({
                                                operator: and,
                                                value: [{
                                                    fieldName: ctx.fieldName,
                                                    operator: ctx.operator,
                                                    value: ctx.value
                                                },
                                                {
                                                    fieldName: ctx.anotherFieldName,
                                                    operator: ctx.anotherOperator,
                                                    value: ctx.value
                                                }]
                                            })
                ).toEqual([{ name: ctx.fieldName, operator: ctx.operator }, { name: ctx.anotherFieldName, operator: ctx.anotherOperator }])
        })
    })

    describe ('queryAdapterOperatorsFor', () => {
        test ('return right operators for type [number]', () => {
            expect(queryAdapterOperatorsFor('number')).toEqual([eq, ne, gt, gte, lt, lte, include])
        })
        
        test('return right operators for type [text]', () => {
            expect(queryAdapterOperatorsFor('text')).toEqual([eq, ne, string_contains, string_begins, string_ends, include, matches, gt, gte, lt, lte])
        })

        test('return right operators for type [boolean]', () => {
            expect(queryAdapterOperatorsFor('boolean')).toEqual([eq])
        })

        test('return right operators for type [url]', () => {
            expect(queryAdapterOperatorsFor('url')).toEqual([eq, ne, string_contains, include])
        })

        test('return right operators for type [datetime]', () => {
            expect(queryAdapterOperatorsFor('datetime')).toEqual([eq, ne, gt, gte, lt, lte])
        })

        test('return right operators for type [image]', () => {
            expect(queryAdapterOperatorsFor('image')).toEqual([])
        })
    })


    const ctx = {
        fieldName: Uninitialized,
        anotherFieldName: Uninitialized,
        operator: Uninitialized,
        anotherOperator: Uninitialized,
        value: Uninitialized,
    }

    beforeEach(() => {
        ctx.fieldName = chance.word()
        ctx.anotherFieldName = chance.word()
        ctx.value = chance.word()
        ctx.operator = gen.randomOperator()
        ctx.anotherOperator = gen.randomOperator()
    })
})