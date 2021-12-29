const { InvalidQuery } = require('velo-external-db-commons').errors
const { AdapterOperators } = require('velo-external-db-commons')
const { Uninitialized, gen } = require('test-commons')
const { EMPTY_FILTER } = require('../converters/utils')
const { extractFieldsAndOperators, validateFilterFieldsExists, validateOperators, queryAdapterOperatorsFor } = require ('./validate_query')
const Chance = require('chance')
const chance = Chance()
const { eq, gt, gte, include, lt, lte, ne, string_begins, string_ends, string_contains, urlized } = AdapterOperators

describe('Validate query', () => {
    describe('extractFieldsAndOperators', () => {
        test('should return empty array when called with empty filter', () => {
            expect(extractFieldsAndOperators(EMPTY_FILTER)).toEqual([])
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
                                                operator: AdapterOperators.and,
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
    
    describe('validateFilterFieldsExists', () => {
        test('will not throw if filter fields exist', () => {
            expect ( () => validateFilterFieldsExists([ctx.fieldName, ctx.anotherFieldName], extractFieldsAndOperators ({
                                                                                        fieldName: ctx.fieldName,
                                                                                        operator: ctx.operator,
                                                                                        value: ctx.value                                                                         
                                                                                    }))
                    ).not.toThrow()
        })

        test('will throw InvalidQuery if filter fields doesn\'t exist', () => {
            expect ( () => validateFilterFieldsExists([ctx.fieldName, ctx.anotherFieldName], extractFieldsAndOperators({
                                                                                        fieldName: 'wrong',
                                                                                        operator: ctx.operator,
                                                                                        value: ctx.value                                                                         
                                                                                    }))
                    ).toThrow(InvalidQuery)
        })
    })

    describe ('queryAdapterOperatorsFor', () => {
        test ('return right operators for type [number]', () => {
            expect(queryAdapterOperatorsFor('number')).toEqual([eq, ne, gt, gte, lt, lte, include])
        })
        
        test('return right operators for type [text]', () => {
            expect(queryAdapterOperatorsFor('text')).toEqual([eq, ne, string_contains, string_begins, string_ends, include, urlized])
        })

        test('return right operators for type [boolean]', () => {
            expect(queryAdapterOperatorsFor('boolean')).toEqual([eq])
        })

        test('return right operators for type [url]', () => {
            expect(queryAdapterOperatorsFor('url')).toEqual([eq, ne, string_contains, include, urlized])
        })

        test('return right operators for type [datetime]', () => {
            expect(queryAdapterOperatorsFor('datetime')).toEqual([eq, ne, gt, gte, lt, lte])
        })

        test('return right operators for type [image]', () => {
            expect(queryAdapterOperatorsFor('image')).toEqual([])
        })
    })

    describe ('validateOperators', () => {
        test('will not throw if use allowed operator for type', () => {
            expect ( () => validateOperators([{ field: ctx.fieldName, type: ctx.type }], extractFieldsAndOperators({ 
                                                                                         fieldName: ctx.fieldName,
                                                                                         operator: ctx.validOperatorForType,
                                                                                         value: ctx.value
                                                                                       }))
                ).not.toThrow()
        })

        test('will throw if use not allowed operator for type', () => {
            expect ( () => validateOperators([{ field: ctx.fieldName, type: ctx.type }], extractFieldsAndOperators({ 
                                                                                         fieldName: ctx.fieldName,
                                                                                         operator: ctx.invalidOperatorForType,
                                                                                         value: ctx.value
                                                                                       }))
                ).toThrow(InvalidQuery)
        })
    })


    const ctx = {
        fieldName: Uninitialized,
        anotherFieldName: Uninitialized,
        operator: Uninitialized,
        anotherOperator: Uninitialized,
        value: Uninitialized,
        type: Uninitialized,
        validOperatorForType: Uninitialized
    }


    beforeEach(() => {
        ctx.filter = gen.randomWrappedFilter()
        ctx.anotherFilter = gen.randomWrappedFilter()
        ctx.fieldName = chance.word()
        ctx.anotherFieldName = chance.word()
        ctx.value = chance.word()
        ctx.operator = gen.randomOperator()
        ctx.anotherOperator = gen.randomOperator()
        ctx.type = gen.randomWixType()
        ctx.validOperatorForType = gen.randomObjectFromArray(queryAdapterOperatorsFor(ctx.type))
        ctx.invalidOperatorForType = gen.randomObjectFromArray (
                                                                Object.values(AdapterOperators).filter(x => !queryAdapterOperatorsFor(ctx.type).includes(x))
                                                               )
    })
})