import each from 'jest-each'
import * as Chance from 'chance'
import { AdapterOperators, errors } from '@wix-velo/velo-external-db-commons'
import { AdapterFunctions } from '@wix-velo/velo-external-db-types'
import { Uninitialized, gen } from '@wix-velo/test-commons'
import FilterParser from './sql_filter_transformer'
import { EmptySort } from './mongo_utils'
const { InvalidQuery } = errors
const chance = Chance()
const { eq, gt, gte, include, lt, lte, ne, string_begins, string_ends, string_contains, and, or, not, urlized, matches } = AdapterOperators
const { avg, max, min, sum, count } = AdapterFunctions

describe('Sql Parser', () => {

    describe('sort parser', () => {

        test('handles undefined sort', () => {
            expect( env.filterParser.orderBy('') ).toEqual(EmptySort)
            expect( env.filterParser.orderBy('    ') ).toEqual(EmptySort)
            expect( env.filterParser.orderBy(undefined) ).toEqual(EmptySort)
            expect( env.filterParser.orderBy(null) ).toEqual(EmptySort)
            expect( env.filterParser.orderBy({ invalid: 'object' }) ).toEqual(EmptySort)
            expect( env.filterParser.orderBy(555) ).toEqual(EmptySort)
            expect( env.filterParser.orderBy([5555]) ).toEqual(EmptySort)
            expect( env.filterParser.orderBy(['sdfsdf']) ).toEqual(EmptySort)
            expect( env.filterParser.orderBy([null]) ).toEqual(EmptySort)
            expect( env.filterParser.orderBy([undefined]) ).toEqual(EmptySort)
            expect( env.filterParser.orderBy([{ invalid: 'object' }]) ).toEqual(EmptySort)
            expect( env.filterParser.orderBy([]) ).toEqual(EmptySort)
        })

        test('process single sort expression invalid sort will return empty result', () => {
            expect( env.filterParser.parseSort({ }) ).toEqual([])
            expect( env.filterParser.parseSort({ invalid: 'object' }) ).toEqual([])
        })

        test('process single sort expression', () => {
            expect(env.filterParser.parseSort({ fieldName: ctx.fieldName, direction: 'asc' })).toEqual({ expr: [`${ctx.fieldName}`, 'asc'] })
            expect(env.filterParser.parseSort({ fieldName: ctx.fieldName, direction: 'aSc' })).toEqual({ expr: [`${ctx.fieldName}`, 'asc'] })
            expect(env.filterParser.parseSort({ fieldName: ctx.fieldName, direction: 'desc' })).toEqual({ expr: [`${ctx.fieldName}`, 'desc'] })
            expect(env.filterParser.parseSort({ fieldName: ctx.fieldName })).toEqual({ expr: [`${ctx.fieldName}`, 'asc'] })
        })

        test('process single sort with valid expression', () => {
            expect(env.filterParser.orderBy([{ fieldName: ctx.fieldName, direction: 'asc' }])).toEqual({ sortExpr: { sort: [[`${ctx.fieldName}`, 'asc']] } })
        })

        test('process single sort with two valid expression', () => {
            expect(env.filterParser.orderBy([{ fieldName: ctx.fieldName, direction: 'asc' },
            { fieldName: ctx.anotherFieldName, direction: 'desc' }])).toEqual({ sortExpr: { sort: [[`${ctx.fieldName}`, 'asc'], [`${ctx.anotherFieldName}`, 'desc']] } })
        })

        test('process single sort with one valid and one invalid expression', () => {
            expect(env.filterParser.orderBy([{ fieldName: ctx.fieldName, direction: 'asc' },
            { invalid: 'object' }])).toEqual({ sortExpr: { sort: [[`${ctx.fieldName}`, 'asc']] } })
        })
    })


    describe('filter parser', () => {

        test('handles undefined filter', () => {
            expect(env.filterParser.parseFilter('')).toEqual([])
            expect(env.filterParser.parseFilter(undefined)).toEqual([])
            expect(env.filterParser.parseFilter(null)).toEqual([])
            expect(env.filterParser.parseFilter(555)).toEqual([])
        })

        test('transform filter', () => {
            expect(env.filterParser.transform(ctx.filter)).toEqual({
                filterExpr: env.filterParser.parseFilter(ctx.filter)[0].filterExpr
            })
        })

        describe('handle single field operator', () => {
            each([
                ne, lt, lte, gt, gte, eq,
            ]).test('correctly transform operator [%s]', (o: any) => {
                const filter = {
                    operator: o,
                    fieldName: ctx.fieldName,
                    value: ctx.fieldValue
                }

                expect(env.filterParser.parseFilter(filter)).toEqual([{
                    filterExpr: { [ctx.fieldName]: { [env.filterParser.adapterOperatorToMongoOperator(o)]: ctx.fieldValue } }
                }
                ])

            })

            test('correctly extract filter value if value is 0', () => {
                const filter = {
                    operator: eq,
                    fieldName: ctx.fieldName,
                    value: 0
                }

                expect(env.filterParser.parseFilter(filter)).toEqual([{
                    filterExpr: { [ctx.fieldName]: { $eq: 0 } }
                }])

            })

            test('correctly transform operator [include]', () => {
                const filter = {
                    operator: include,
                    fieldName: ctx.fieldName,
                    value: ctx.fieldListValue
                }

                expect(env.filterParser.parseFilter(filter)).toEqual([{
                    filterExpr: { [ctx.fieldName]: { $in: ctx.fieldListValue } }
                }])
            })

            test('operator [include] with empty list of values will throw an exception', () => {
                const filter = {
                    operator: include,
                    fieldName: ctx.fieldName,
                    value: []
                }

                expect(() => env.filterParser.parseFilter(filter)).toThrow(InvalidQuery)
            })

            test('correctly transform operator [eq] with null value', () => {
                const filter = {
                    operator: eq,
                    fieldName: ctx.fieldName,
                    value: undefined                    
                }

                expect(env.filterParser.parseFilter(filter)).toEqual([{
                    filterExpr: { [ctx.fieldName]: { $eq: null } }
                }])
            })

            test('correctly transform operator [eq] with boolean value', () => {
                const value = chance.bool()
                const filter = {
                    operator: eq,
                    fieldName: ctx.fieldName,
                    value
                }

                expect(env.filterParser.parseFilter(filter)).toEqual([{
                    filterExpr: { [ctx.fieldName]: { $eq: value } }
                }])
            })

            describe('handle string operators', () => {
                test('correctly transform operator [string_contains]', () => {
                    const filter = {
                        operator: string_contains,
                        fieldName: ctx.fieldName,
                        value: ctx.fieldValue
                    }
                    expect(env.filterParser.parseFilter(filter)).toEqual([{
                        filterExpr: { [ctx.fieldName]: { $regex: `${ctx.fieldValue}`, $options: 'i' } }
                    }])
                })

                test('correctly transform operator [string_begins]', () => {
                    const filter = {
                        operator: string_begins,
                        fieldName: ctx.fieldName,
                        value: ctx.fieldValue
                    }

                    expect(env.filterParser.parseFilter(filter)).toEqual([{
                        filterExpr: { [ctx.fieldName]: { $regex: `^${ctx.fieldValue}`, $options: 'i' } }
                    }])
                })

                test('correctly transform operator [string_ends]', () => {
                    const filter = {
                        operator: string_ends,
                        fieldName: ctx.fieldName,
                        value: ctx.fieldValue
                    }

                    expect(env.filterParser.parseFilter(filter)).toEqual([{
                        filterExpr: { [ctx.fieldName]: { $regex: `${ctx.fieldValue}$`, $options: 'i' } }
                    }])
                })

                test('correctly transform operator [urlized]', () => {
                    const filter = {
                        operator: urlized,
                        fieldName: ctx.fieldName,
                        value: ctx.fieldListValue
                    }

                    expect(env.filterParser.parseFilter(filter)).toEqual([{
                        filterExpr: { [ctx.fieldName]: { $regex: `/${ctx.fieldListValue.map((s: string) => s.toLowerCase()).join('.*')}/i` } }
                    }])
                })

                test('correctly transform operator [matches] with ignoreCase', () => {
                    const filter = {
                        operator: matches,
                        fieldName: ctx.fieldName,
                        value: {
                            ignoreCase: true,
                            spec: [ 
                                { type: 'literal', value: ctx.fieldValue },
                                { type: 'anyOf', value: ctx.anotherValue },
                                { type: 'literal', value: ctx.moreValue },
                            ]
                        }
                    }

                    expect(env.filterParser.parseFilter(filter)).toEqual([{
                        filterExpr: { [ctx.fieldName]: { 
                                                            $regex: `${ctx.fieldValue.toLowerCase()}[${ctx.anotherValue.toLowerCase()}]${ctx.moreValue.toLowerCase()}`, 
                                                            $options: 'i' 
                                                       } 
                                    }
                    }])
                })
                
                test('correctly transform operator [matches] with ignoreCase', () => {
                    const filter = {
                        operator: matches,
                        fieldName: ctx.fieldName,
                        value: {
                            ignoreCase: false,
                            spec: [ 
                                { type: 'literal', value: ctx.fieldValue },
                                { type: 'anyOf', value: ctx.anotherValue },
                                { type: 'literal', value: ctx.moreValue },
                            ]
                        }
                    }

                    expect(env.filterParser.parseFilter(filter)).toEqual([{
                        filterExpr: { [ctx.fieldName]: { 
                                                            $regex: `${ctx.fieldValue.toLowerCase()}[${ctx.anotherValue.toLowerCase()}]${ctx.moreValue.toLowerCase()}`, 
                                                            $options: '' 
                                                       } 
                                    }
                    }])
                })
            })
        })

        describe('handle multi field operator', () => {
            each([
                and, or,
            ]).test('correctly transform operator [%s]', (o: any) => {
                const filter = {
                    operator: o,
                    value: [ctx.filter, ctx.anotherFilter]
                }

                const filter1 = env.filterParser.parseFilter(ctx.filter)[0]
                const filter2 = env.filterParser.parseFilter(ctx.anotherFilter)[0]

                expect(env.filterParser.parseFilter(filter)).toEqual([{
                    filterExpr: { [`$${o}`]: [filter1.filterExpr, filter2.filterExpr] }
                }])
            })
            
            each([
                and, or
            ]).test('correctly transform operator [%s] with only one filter', (o: any) => {
                const filter = {
                    operator: o,
                    value: [ctx.filter, {}]
                }

                const filter1 = env.filterParser.parseFilter(ctx.filter)[0]

                expect(env.filterParser.parseFilter(filter)).toEqual([{
                    filterExpr: { [`$${o}`]: [filter1.filterExpr, {}] }
                }])
            })

            test('correctly transform operator [not]', () => {
                const filter = {
                    operator: not,
                    value: [ ctx.filter ]
                }

                expect(env.filterParser.parseFilter(filter)).toEqual([{
                    filterExpr: { $nor: [env.filterParser.parseFilter(ctx.filter)[0].filterExpr] }
                }])
            })
        })

        describe('transform projection', () => {
            test('projection handle single field projection', () => {
                expect(env.filterParser.selectFieldsFor([ctx.fieldName])).toEqual({ [ctx.fieldName]: 1, _id: 0 })
            })

            test('projection handle projection with _id', () => {
                expect(env.filterParser.selectFieldsFor([ctx.fieldName, '_id'])).toEqual({ [ctx.fieldName]: 1, _id: 1 })
            })
            
            test('projection handle multiple field projection', () => {
                expect(env.filterParser.selectFieldsFor([ctx.fieldName, ctx.anotherFieldName])).toEqual(
                        { [ctx.fieldName]: 1, [ctx.anotherFieldName]: 1, _id: 0 }
                    )
            })


        })

        describe('aggregation functions', () => {

            describe('transform select fields', () => {
                test('single id field', () => {
                    const aggregation = {
                        projection: [{ name: ctx.fieldName }]
                    }

                    expect(env.filterParser.parseAggregation(aggregation)).toEqual({
                        fieldsStatement: { $group: { _id: { [ctx.fieldName]: `$${ctx.fieldName}` } } },
                        havingFilter: { $match: {} },
                    })
                })

                test('multiple id fields', () => {
                    const aggregation = {
                            projection: [
                                { name: ctx.fieldName },
                                { name: ctx.anotherFieldName }
                            ]
                       }

                    expect(env.filterParser.parseAggregation(aggregation)).toEqual({
                        fieldsStatement: {
                            $group: {
                                _id: {
                                    [ctx.fieldName]: `$${ctx.fieldName}`,
                                    [ctx.anotherFieldName]: `$${ctx.anotherFieldName}`
                                }
                            }
                        },
                        havingFilter: { $match: {} },
                    })
                })

                test('process having filter', () => {
                    const aggregation = {
                        projection: [
                            { name: ctx.fieldName },
                            { name: ctx.anotherFieldName, function: avg, alias: ctx.moreFieldName }
                        ],
                        postFilter: {
                            operator: gt,
                            fieldName: ctx.moreFieldName,
                            value: ctx.fieldValue
                        }
                    }

                    expect(env.filterParser.parseAggregation(aggregation)).toEqual({
                        fieldsStatement: {
                            $group: {
                                _id: {
                                    [ctx.fieldName]: `$${(ctx.fieldName)}`
                                },
                                [ctx.moreFieldName]: { $avg: `$${ctx.anotherFieldName}` }
                            }
                        },
                        havingFilter: { $match: { [ctx.moreFieldName]: { $gt: ctx.fieldValue } } },

                    })
                })


                each([
                    ['$avg', avg],
                    ['$min', min],
                    ['$max', max],
                    ['$sum', sum],
                ]).test('translate %s function', (mongoFunction: any, adapterFunction: any) => {
                    const aggregation = {
                        projection: [
                            { name: ctx.fieldName },
                            { name: ctx.anotherFieldName, function: adapterFunction, alias: ctx.moreFieldName }
                        ]
                    }

                    expect(env.filterParser.parseAggregation(aggregation)).toEqual({
                        fieldsStatement: {
                            $group: {
                                _id: {
                                    [ctx.fieldName]: `$${ctx.fieldName}`
                                },
                                [ctx.moreFieldName]: { [mongoFunction]: `$${ctx.anotherFieldName}` }
                            }
                        },
                        havingFilter: { $match: {} },
                    })
                })

                test('translate $count function', () => {
                    const aggregation = {
                        projection: [
                            { name: ctx.fieldName },
                            { name: '*', alias: ctx.moreFieldName, function: count }
                        ]
                    }

                    expect(env.filterParser.parseAggregation(aggregation)).toEqual({
                        fieldsStatement: {
                            $group: {
                                _id: {
                                    [ctx.fieldName]: `$${ctx.fieldName}`
                                },
                                [ctx.moreFieldName]: { $sum: 1 }
                            }
                        },
                        havingFilter: { $match: {} },
                    })
                })

                test('orderAggregationBy', () => {
                    expect(env.filterParser.orderAggregationBy([
                        { fieldName: ctx.fieldName, direction: ctx.direction },
                    ])).toEqual({
                        $sort: { 
                            [ctx.fieldName]: ctx.direction === 'asc' ? 1 : -1 
                        }
                    })

                    expect(env.filterParser.orderAggregationBy([
                        { fieldName: ctx.fieldName, direction: ctx.direction },
                        { fieldName: ctx.anotherFieldName, direction: ctx.anotherDirection },
                    ])).toEqual({
                        $sort: { 
                            [ctx.fieldName]: ctx.direction === 'asc' ? 1 : -1,
                            [ctx.anotherFieldName]: ctx.anotherDirection === 'asc' ? 1 : -1 
                        }
                    })


                })
            })

        })

    })

    interface Context {
        fieldName: string
        fieldValue: string
        anotherValue: string
        moreValue: string
        fieldListValue: string[]
        anotherFieldName: string
        moreFieldName: string
        filter: { fieldName: string; operator: string; value: string | string[] }
        anotherFilter: { fieldName: string; operator: string; value: string | string[]; }
        offset: number
        direction: 'asc' | 'desc'
        anotherDirection: 'asc' | 'desc'
    }

    const ctx : Context = {
        fieldName: Uninitialized,
        fieldValue: Uninitialized,
        anotherValue: Uninitialized,
        moreValue: Uninitialized,
        fieldListValue: Uninitialized,
        anotherFieldName: Uninitialized,
        moreFieldName: Uninitialized,
        filter: Uninitialized,
        anotherFilter: Uninitialized,
        offset: Uninitialized,
        direction: Uninitialized,
        anotherDirection: Uninitialized,
    }

    interface Enviorment {
        filterParser: any
    }

    const env : Enviorment= {
        filterParser: Uninitialized,
    }

    beforeEach(() => {
        ctx.fieldName = chance.word()
        ctx.anotherFieldName = chance.word()
        ctx.moreFieldName = chance.word()

        ctx.fieldValue = chance.word()
        ctx.anotherValue = chance.word()
        ctx.moreValue = chance.word()
        ctx.fieldListValue = [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()]

        ctx.filter = gen.randomWrappedFilter()
        ctx.anotherFilter = gen.randomWrappedFilter()

        ctx.offset = chance.natural({ min: 2, max: 20 })

        ctx.direction = chance.pickone(['asc', 'desc'])
        ctx.anotherDirection = chance.pickone(['asc', 'desc'])
    })

    beforeAll(function() {
        env.filterParser = new FilterParser
    })

})
