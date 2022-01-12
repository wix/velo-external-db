const { InvalidQuery } = require('velo-external-db-commons').errors
const { Uninitialized, gen } = require('test-commons')
const { extractFieldsAndOperators, queryAdapterOperatorsFor } = require ('./query_validator_utils')
const QueryValidator = require ('./query_validator')
const Chance = require('chance')
const chance = Chance()

describe('Query Validator', () => {
    beforeAll(() => {
        env.queryValidator = new QueryValidator()
    })

    describe('validateFilterFieldsExists', () => {
        test('will not throw if filter fields exist', () => {
            expect ( () => env.queryValidator.validateFilterFieldsExists([ctx.fieldName, ctx.anotherFieldName], extractFieldsAndOperators ({
                                                                                        fieldName: ctx.fieldName,
                                                                                        operator: ctx.operator,
                                                                                        value: ctx.value                                                                         
                                                                                    }))
                    ).not.toThrow()
        })

        test('will throw InvalidQuery if filter fields doesn\'t exist', () => {
            expect ( () => env.queryValidator.validateFilterFieldsExists([ctx.fieldName, ctx.anotherFieldName], extractFieldsAndOperators({
                                                                                        fieldName: 'wrong',
                                                                                        operator: ctx.operator,
                                                                                        value: ctx.value                                                                         
                                                                                    }))
                    ).toThrow(InvalidQuery)
        })
    })

    describe ('validateOperators', () => {
        test('will not throw if use allowed operator for type', () => {
            expect ( () => env.queryValidator.validateOperators([{ field: ctx.fieldName, type: ctx.type }], extractFieldsAndOperators({ 
                                                                                         fieldName: ctx.fieldName,
                                                                                         operator: ctx.validOperatorForType,
                                                                                         value: ctx.value
                                                                                       }))
                ).not.toThrow()
        })

        test('will throw if use not allowed operator for type', () => {
            expect ( () => env.queryValidator.validateOperators([{ field: ctx.fieldName, type: ctx.type }], extractFieldsAndOperators({ 
                                                                                         fieldName: ctx.fieldName,
                                                                                         operator: ctx.invalidOperatorForType,
                                                                                         value: ctx.value
                                                                                       }))
                ).toThrow(InvalidQuery)
        })
    })

    const env = {
        queryValidator: Uninitialized
    }

    const ctx = {
        fieldName: Uninitialized,
        anotherFieldName: Uninitialized,
        operator: Uninitialized,
        value: Uninitialized,
        type: Uninitialized,
        validOperatorForType: Uninitialized
    }


    beforeEach(() => {
        ctx.fieldName = chance.word()
        ctx.anotherFieldName = chance.word()
        ctx.value = chance.word()
        ctx.operator = gen.randomOperator()
        ctx.type = gen.randomWixType()
        ctx.validOperatorForType = gen.randomObjectFromArray(queryAdapterOperatorsFor(ctx.type))
        ctx.invalidOperatorForType = gen.invalidOperatorForType(queryAdapterOperatorsFor(ctx.type))
    })
})