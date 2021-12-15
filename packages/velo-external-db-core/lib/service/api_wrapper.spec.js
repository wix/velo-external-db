const { Uninitialized, gen } = require('test-commons')
const ApiWrapper = require('./api_wrapper')
const { AdapterOperators, EMPTY_FILTER } = require ('./api_wrapper_utils')
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


    const env = {
        ApiWrapper: Uninitialized
    }

    const ctx = {
        filter: Uninitialized,
        fieldName: Uninitialized,
        fieldValue: Uninitialized,
        operator: Uninitialized,
        fieldListValue: Uninitialized
    }

    beforeEach(() => {
        ctx.filter = gen.randomFilter()
        ctx.anotherFilter = gen.randomFilter()
        ctx.fieldName = chance.word()
        ctx.fieldValue = chance.word()
        ctx.operator = gen.randomOperator()
        ctx.fieldListValue = [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()]

    })
})