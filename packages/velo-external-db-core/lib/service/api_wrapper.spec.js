const { Uninitialized, gen } = require('test-commons')
const ApiWrapper = require('./api_wrapper')
const { AdapterOperators, AdapterFunctions, EMPTY_FILTER } = require ('./api_wrapper_utils')
const Chance = require('chance')
const chance = Chance()
const each = require('jest-each').default

describe('Api Wrapper', () => {
    beforeAll(() => {
        env.ApiWrapper = new ApiWrapper
    })
    describe('correctly transform Wix operators to adapter operators', () => {
        each([
            '$eq', '$ne', '$lt', '$lte', '$gt', '$gte', '$or', '$and', '$not'
        ])
        .test('correctly transform [%s]', (o) => {
            const adapterOperator = o.substring(1) 
            expect(env.ApiWrapper.wixOperatorToAdapterOperator(o)).toEqual(AdapterOperators[adapterOperator])
        })

        test('correctly transform [$hasSome]', () => {
            expect(env.ApiWrapper.wixOperatorToAdapterOperator('$hasSome')).toEqual(AdapterOperators.in)
        })

        test('correctly transform [$contains]', () => {
            expect(env.ApiWrapper.wixOperatorToAdapterOperator('$contains')).toEqual(AdapterOperators.string_contains)
        })

        test('correctly transform [$startsWith]', () => {
            expect(env.ApiWrapper.wixOperatorToAdapterOperator('$startsWith')).toEqual(AdapterOperators.string_begins)
        })

        test('correctly transform [$endsWith]', () => {
            expect(env.ApiWrapper.wixOperatorToAdapterOperator('$endsWith')).toEqual(AdapterOperators.string_ends)
        })
    })
    
    describe('correctly transform Wix filter to adapter filter', () => {
        test('handles undefined filter', () => {
            expect(env.ApiWrapper.parseFilter('')).toEqual(EMPTY_FILTER)
            expect(env.ApiWrapper.parseFilter(undefined)).toEqual(EMPTY_FILTER)
            expect(env.ApiWrapper.parseFilter(null)).toEqual(EMPTY_FILTER)
            expect(env.ApiWrapper.parseFilter(555)).toEqual(EMPTY_FILTER)
            
        })

        test('handles empty filter', () => {
            expect(env.ApiWrapper.parseFilter({})).toEqual(EMPTY_FILTER)
            expect(env.ApiWrapper.parseFilter([])).toEqual(EMPTY_FILTER)
        })

        describe('handle single field operator', () => {
            each([
                '$ne', '$lt', '$lte', '$gt', '$gte', '$eq'
            ]).test('correctly transform operator [%s]', (o) => {
                expect(env.ApiWrapper.parseFilter(
                    { [ctx.fieldName]: { [o]: ctx.fieldValue } }
                ))
                .toEqual({ fieldName: ctx.fieldName, operator: env.ApiWrapper.wixOperatorToAdapterOperator(o), value: ctx.fieldValue })
            })

            test('correctly transform operator [$hasSome]', () => {
                expect(env.ApiWrapper.parseFilter(
                    { [ctx.fieldName]: { $hasSome: ctx.fieldListValue } }
                ))
                .toEqual({ 
                    fieldName: ctx.fieldName, operator: env.ApiWrapper.wixOperatorToAdapterOperator('$hasSome'), value: ctx.fieldListValue
                })
            })
            
            describe('handle string operators', () => { 
                test('correctly transform operator [$contains]', () => {
                    const filter = {
                        [ctx.fieldName]: { $contains: ctx.fieldValue }
                    }
                    expect(env.ApiWrapper.parseFilter(filter)).toEqual({
                        fieldName: ctx.fieldName, operator: env.ApiWrapper.wixOperatorToAdapterOperator('$contains'), value: ctx.fieldValue
                    })
                })
                
                test('correctly transform operator [$startsWith]', () => {
                    const filter = {
                        [ctx.fieldName]: { $startsWith: ctx.fieldValue }
                    }
                    expect(env.ApiWrapper.parseFilter(filter)).toEqual({
                        fieldName: ctx.fieldName, operator: env.ApiWrapper.wixOperatorToAdapterOperator('$startsWith'), value: ctx.fieldValue
                    })
                })
                
                test('correctly transform operator [$endsWith]', () => {
                    const filter = {
                        [ctx.fieldName]: { $endsWith: ctx.fieldValue }
                    }
                    expect(env.ApiWrapper.parseFilter(filter)).toEqual({
                        fieldName: ctx.fieldName, operator: env.ApiWrapper.wixOperatorToAdapterOperator('$endsWith'), value: ctx.fieldValue
                    })
                })
            })
            describe('handle multi field operator', () => {
                each([
                    '$and', '$or'
                ]).test('correctly transform operator [%s]', (o) => {
                    const filter = {
                        [o]: [ctx.filter, ctx.anotherFilter]
                    }
                    const filter1 = env.ApiWrapper.parseFilter(ctx.filter)
                    const filter2 = env.ApiWrapper.parseFilter(ctx.anotherFilter)
        
                    expect(env.ApiWrapper.parseFilter(filter)).toEqual({
                        operator: env.ApiWrapper.wixOperatorToAdapterOperator(o),
                        value: [filter1, filter2]
                    })
                })
        
                test('correctly transform operator [$not]', () => {
                    const filter = {
                        $not: [ctx.filter]
                    }
        
                    expect(env.ApiWrapper.parseFilter(filter)).toEqual({
                        operator: env.ApiWrapper.wixOperatorToAdapterOperator('$not'),
                        value: [env.ApiWrapper.parseFilter(ctx.filter)]
                    })
                })
            })
                
        })
    })


    describe('correctly transform Wix functions to adapter functions', () => {
        each([
            '$avg', '$max', '$min', '$sum'
        ])
        .test('correctly transform [%s]', (f) => {
            const AdapterFunction = f.substring(1) 
            expect(env.ApiWrapper.wixFunctionToAdapterFunction(f)).toEqual(AdapterFunctions[AdapterFunction])
        })
    })

    describe('Parse aggregation', () => {
        test('single id field without function or postFilter', () => {
            const processingStep = { _id: `$${ctx.fieldName}` }
            const postFilteringStep = null

            expect(env.ApiWrapper.parseAggregation(processingStep, postFilteringStep)).toEqual({
                projection: [{ name: ctx.fieldName, alias: ctx.fieldName }],
                postFilter: EMPTY_FILTER
            })
        })

        test('multiple id fields without function or postFilter', () => {
            const processingStep = {
                _id: {
                    field1: `$${ctx.fieldName}`,
                    field2: `$${ctx.anotherFieldName}`
                }
            }
            const postFilteringStep = null

            expect(env.ApiWrapper.parseAggregation(processingStep, postFilteringStep)).toEqual({
                projection: [
                                { name: ctx.fieldName, alias: ctx.fieldName },
                                { name: ctx.anotherFieldName, alias: ctx.anotherFieldName }
                            ],
                postFilter: EMPTY_FILTER
            })
        })

        test('single id field with function field and without postFilter', () => {
            const processingStep = {
                _id: `$${ctx.fieldName}`,
                [ctx.fieldAlias]: {
                     $avg: `$${ctx.anotherFieldName}`
                 }
            }
            const postFilteringStep = null

            expect(env.ApiWrapper.parseAggregation(processingStep, postFilteringStep)).toEqual({
                projection: [
                                { name: ctx.fieldName, alias: ctx.fieldName }, 
                                { name: ctx.anotherFieldName, alias: ctx.fieldAlias, function: AdapterFunctions.avg }
                            ],
                postFilter: EMPTY_FILTER
            })
        })

        test('single id field with count function and without postFilter', () => {
            const processingStep = {
                _id: `$${ctx.fieldName}`,
                [ctx.fieldAlias]: {
                     $sum: 1
                 }
            }
            const postFilteringStep = null

            expect(env.ApiWrapper.parseAggregation(processingStep, postFilteringStep)).toEqual({
                projection: [
                                { name: ctx.fieldName, alias: ctx.fieldName }, 
                                { alias: ctx.fieldAlias, function: AdapterFunctions.count }
                            ],
                postFilter: EMPTY_FILTER
            })
        })
       
        test('multiple function fields and without postFilter', () => {
            const processingStep = {
                _id: `$${ctx.fieldName}`,
                [ctx.fieldAlias]: {
                     $avg: `$${ctx.anotherFieldName}`
                 },
                 [ctx.anotherFieldAlias]: {
                     $sum: `$${ctx.moreFieldName}`
                 }
            }
            const postFilteringStep = null

            expect(env.ApiWrapper.parseAggregation(processingStep, postFilteringStep)).toEqual({
                projection: [
                                { name: ctx.fieldName, alias: ctx.fieldName }, 
                                { name: ctx.anotherFieldName, alias: ctx.fieldAlias, function: AdapterFunctions.avg },
                                { name: ctx.moreFieldName, alias: ctx.anotherFieldAlias, function: AdapterFunctions.sum }
                            ],
                postFilter: EMPTY_FILTER
            })
        })

        test('function and postFilter', () => {
            const processingStep = {
                _id: `$${ctx.fieldName}`,
                [ctx.fieldAlias]: {
                     $avg: `$${ctx.anotherFieldName}`
                 }
            }
            
            const postFilteringStep = ctx.filter

            expect(env.ApiWrapper.parseAggregation(processingStep, postFilteringStep)).toEqual({
                projection: [
                                { name: ctx.fieldName, alias: ctx.fieldName }, 
                                { name: ctx.anotherFieldName, alias: ctx.fieldAlias, function: AdapterFunctions.avg }
                            ],
                postFilter: env.ApiWrapper.parseFilter(ctx.filter)
            })
        })
    })


    const env = {
        ApiWrapper: Uninitialized
    }

    const ctx = {
        filter: Uninitialized,
        fieldName: Uninitialized,
        anotherFieldName: Uninitialized,
        moreFieldName: Uninitialized,
        fieldAlias: Uninitialized,
        anotherFieldAlias: Uninitialized,
        fieldValue: Uninitialized,
        operator: Uninitialized,
        fieldListValue: Uninitialized,
    }

    beforeEach(() => {
        ctx.filter = gen.randomFilter()
        ctx.anotherFilter = gen.randomFilter()
        ctx.fieldName = chance.word()
        ctx.anotherFieldName = chance.word()
        ctx.moreFieldName = chance.word()
        ctx.fieldAlias = chance.word()
        ctx.anotherFieldAlias = chance.word()
        ctx.fieldValue = chance.word()
        ctx.operator = gen.randomOperator()
        ctx.fieldListValue = [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()]
    })
})