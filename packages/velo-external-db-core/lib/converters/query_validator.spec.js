const { InvalidQuery } = require('velo-external-db-commons').errors
const { Uninitialized, gen } = require('test-commons')
const { EMPTY_FILTER } = require ('../converters/utils')
const { queryAdapterOperatorsFor } = require ('./query_validator_utils')
const QueryValidator = require ('./query_validator')
const Chance = require('chance')
const chance = Chance()

describe('Query Validator', () => {
    beforeAll(() => {
        env.queryValidator = new QueryValidator()
    })

    describe('validateFilter', () => {
        test('will not throw if filter fields exist', () => {
            const filter = {
                fieldName: ctx.fieldName,
                operator: ctx.validOperatorForType,
                value: ctx.value
            }
            expect ( () => env.queryValidator.validateFilter([{ field: ctx.fieldName, type: ctx.type }], filter)).not.toThrow()
        })
    
    
        test('will throw InvalidQuery if filter fields doesn\'t exist', () => {
            const filter = {
                fieldName: 'wrong',
                operator: ctx.validOperatorForType,
                value: ctx.value
            }

            expect ( () => env.queryValidator.validateFilter([{ field: ctx.fieldName, type: ctx.type }], filter)).toThrow(InvalidQuery)
        })

        test('will not throw if use allowed operator for type', () => {
            const filter = {
                fieldName: ctx.fieldName,
                operator: ctx.validOperatorForType,
                value: ctx.value
            }
            expect ( () => env.queryValidator.validateFilter([{ field: ctx.fieldName, type: ctx.type }], filter)).not.toThrow()
        })
        
        test('will throw if use not allowed operator for type', () => {
            const filter = {
                fieldName: ctx.fieldName,
                operator: ctx.invalidOperatorForType,
                value: ctx.value
            }
            expect ( () => env.queryValidator.validateFilter([{ field: ctx.fieldName, type: ctx.type }], filter)).toThrow(InvalidQuery)
        })
    })

    describe ('validateGetById', () => {
        test('should throw InvalidQuery if itemId is not defined', () => {
            expect ( () => env.queryValidator.validateGetById(ctx.fieldArrWithId)).toThrow(InvalidQuery)
            expect ( () => env.queryValidator.validateGetById(ctx.fieldArrWithId, '')).toThrow(InvalidQuery)
            expect ( () => env.queryValidator.validateGetById(ctx.fieldArrWithId, null)).toThrow(InvalidQuery)
            expect ( () => env.queryValidator.validateGetById(ctx.fieldArrWithId, undefined)).toThrow(InvalidQuery)
        })

        test('should not throw with any string but empty for itemId', () => {
            expect ( () => env.queryValidator.validateGetById(ctx.fieldArrWithId, '0')).not.toThrow()
            expect ( () => env.queryValidator.validateGetById(ctx.fieldArrWithId, ctx.itemId)).not.toThrow()
        })

        test('should throw Invalid if _id fields doesn\'t exist', () => {
            expect ( () => env.queryValidator.validateGetById([{ field: ctx.fieldName, type: ctx.type }], '0')).toThrow(InvalidQuery)
        })  
    })

    describe('validateAggregation', () => {
        test('will not throw if projection fields exist', () => {
            const aggregation = {
                projection: [{ name: ctx.fieldName }],
                postFilter: EMPTY_FILTER
            }
            expect ( () => env.queryValidator.validateAggregation([{ field: ctx.fieldName, type: ctx.type }], aggregation)).not.toThrow()

        })

        test('will not throw with projection on alias', () => {
            const aggregation = {
                projection: [{ name: ctx.fieldName, alias: ctx.anotherFieldName }],
                postFilter: EMPTY_FILTER
            }
            expect ( () => env.queryValidator.validateAggregation([{ field: ctx.fieldName, type: ctx.type }], aggregation)).not.toThrow()
        })
        
        test('will not throw with valid filter', () => {
            const aggregation = {
                projection: [{ name: ctx.fieldName }],
                postFilter: {
                    fieldName: ctx.fieldName,
                    operator: ctx.validOperatorForType,
                    value: ctx.value
                }
            }
            expect ( () => env.queryValidator.validateAggregation([{ field: ctx.fieldName, type: ctx.type }], aggregation)).not.toThrow()
        })
        
        test('will not throw with valid filter on alias', () => {
            const aggregation = {
                projection: [{ name: ctx.fieldName, alias: ctx.anotherFieldName }],
                postFilter: {
                    fieldName: ctx.anotherFieldName,
                    operator: ctx.validOperatorForType,
                    value: ctx.value
                }
            }
            expect ( () => env.queryValidator.validateAggregation([{ field: ctx.fieldName, type: ctx.type }], aggregation)).not.toThrow()
        })
        
        test('will throw Invalid Query with filter on non exist field', () => {
            const aggregation = {
                projection: [{ name: ctx.fieldName, alias: ctx.anotherFieldName }],
                postFilter: {
                    fieldName: 'wrong',
                    operator: ctx.validOperatorForType,
                    value: ctx.value
                }
            }
            expect ( () => env.queryValidator.validateAggregation([{ field: ctx.fieldName, type: ctx.type }], aggregation)).toThrow(InvalidQuery)
        })
        
        test('will throw Invalid Query with projection with non exist field', () => {
            const aggregation = {
                projection: [{ name: 'wrong' }],
                postFilter: EMPTY_FILTER
            }
            expect ( () => env.queryValidator.validateAggregation([{ field: ctx.fieldName, type: ctx.type }], aggregation)).toThrow(InvalidQuery)
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
        validOperatorForType: Uninitialized,
        fieldArrWithId: Uninitialized,
        itemId: Uninitialized
    }


    beforeEach(() => {
        ctx.fieldName = chance.word()
        ctx.anotherFieldName = chance.word()
        ctx.value = chance.word()
        ctx.operator = gen.randomOperator()
        ctx.type = gen.randomWixType()
        ctx.fieldArrWithId = [{ field: '_id', type: 'text' }]
        ctx.validOperatorForType = gen.randomObjectFromArray(queryAdapterOperatorsFor(ctx.type))
        ctx.invalidOperatorForType = gen.invalidOperatorForType(queryAdapterOperatorsFor(ctx.type))
        ctx.itemId = chance.word()
    })
})