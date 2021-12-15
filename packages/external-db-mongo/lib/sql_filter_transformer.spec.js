const FilterParser = require('./sql_filter_transformer')
const { EMPTY_SORT } = require('velo-external-db-commons')
const { Uninitialized, gen } = require('test-commons')
const { InvalidQuery } = require('velo-external-db-commons').errors
const each = require('jest-each').default
const Chance = require('chance')
const chance = Chance()

describe('Sql Parser', () => {

    describe('sort parser', () => {

        test('handles undefined sort', () => {
            expect( env.filterParser.orderBy('') ).toEqual(EMPTY_SORT)
            expect( env.filterParser.orderBy('    ') ).toEqual(EMPTY_SORT)
            expect( env.filterParser.orderBy(undefined) ).toEqual(EMPTY_SORT)
            expect( env.filterParser.orderBy(null) ).toEqual(EMPTY_SORT)
            expect( env.filterParser.orderBy({ invalid: 'object' }) ).toEqual(EMPTY_SORT)
            expect( env.filterParser.orderBy(555) ).toEqual(EMPTY_SORT)
            expect( env.filterParser.orderBy([5555]) ).toEqual(EMPTY_SORT)
            expect( env.filterParser.orderBy(['sdfsdf']) ).toEqual(EMPTY_SORT)
            expect( env.filterParser.orderBy([null]) ).toEqual(EMPTY_SORT)
            expect( env.filterParser.orderBy([undefined]) ).toEqual(EMPTY_SORT)
            expect( env.filterParser.orderBy([{ invalid: 'object' }]) ).toEqual(EMPTY_SORT)
            expect( env.filterParser.orderBy([]) ).toEqual(EMPTY_SORT)
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
                '$ne', '$lt', '$lte', '$gt', '$gte', '$eq',
            ]).test('correctly transform operator [%s]', (o) => {
                const filter = {
                    [ctx.fieldName]: { [o]: ctx.fieldValue }
                }


                expect(env.filterParser.parseFilter(filter)).toEqual([{
                    filterExpr: { [ctx.fieldName]: { [o]: ctx.fieldValue } }
                }
                ])

            })

            test('correctly extract filter value if value is 0', () => {
                const filter = {
                    [ctx.fieldName]: { $eq: 0 }
                }

                expect(env.filterParser.parseFilter(filter)).toEqual([{
                    filterExpr: { [ctx.fieldName]: { $eq: 0 } }
                }])

            })

            // todo: $hasAll ???
            test('correctly transform operator [$hasSome]', () => {
                const filter = {
                    [ctx.fieldName]: { $hasSome: ctx.fieldListValue }
                }

                expect(env.filterParser.parseFilter(filter)).toEqual([{
                    filterExpr: { [ctx.fieldName]: { $in: ctx.fieldListValue } }
                }])
            })

            test('operator [$hasSome] with empty list of values will throw an exception', () => {
                const filter = {
                    [ctx.fieldName]: { $hasSome: [] }
                }

                expect(() => env.filterParser.parseFilter(filter)).toThrow(InvalidQuery)
            })

            test('correctly transform operator [$eq] with null value', () => {
                const filter = {
                    [ctx.fieldName]: { $eq: undefined } 
                }

                expect(env.filterParser.parseFilter(filter)).toEqual([{
                    filterExpr: { [ctx.fieldName]: { $eq: null } }
                }])
            })

            test('correctly transform operator [$eq] with boolean value', () => {
                const value = chance.bool()
                const filter = {
                    [ctx.fieldName]: { $eq: value } 
                }

                expect(env.filterParser.parseFilter(filter)).toEqual([{
                    filterExpr: { [ctx.fieldName]: { $eq: value } }
                }])
            })

            describe('handle string operators', () => {
                test('correctly transform operator [$contains]', () => {
                    const filter = {
                        [ctx.fieldName]: { $contains: ctx.fieldValue }
                    }
                    expect(env.filterParser.parseFilter(filter)).toEqual([{
                        filterExpr: { [ctx.fieldName]: { $regex: ctx.fieldValue } }
                    }])
                })

                test('correctly transform operator [$startsWith]', () => {
                    const filter = {
                        [ctx.fieldName]: { $startsWith: ctx.fieldValue }                  
                    }

                    expect(env.filterParser.parseFilter(filter)).toEqual([{
                        filterExpr: { [ctx.fieldName]: { $regex: `^${ctx.fieldValue}` } }
                    }])
                })

                test('correctly transform operator [$endsWith]', () => {
                    const filter = {
                        [ctx.fieldName]: { $endsWith: ctx.fieldValue }
                    }

                    expect(env.filterParser.parseFilter(filter)).toEqual([{
                        filterExpr: { [ctx.fieldName]: { $regex: `${ctx.fieldValue}$` } }
                    }])
                })

                test('correctly transform operator [$urlized]', () => {
                    const filter = {
                        [ctx.fieldName]: { $urlized: ctx.fieldListValue } 
                    }

                    expect(env.filterParser.parseFilter(filter)).toEqual([{
                        filterExpr: { [ctx.fieldName]: { $regex: `/${ctx.fieldListValue.map(s => s.toLowerCase()).join('.*')}/i` } }
                    }])
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

                const filter1 = env.filterParser.parseFilter(ctx.filter)[0]
                const filter2 = env.filterParser.parseFilter(ctx.anotherFilter)[0]

                expect(env.filterParser.parseFilter(filter)).toEqual([{
                    filterExpr: { [o]: [filter1.filterExpr, filter2.filterExpr] }
                }])
            })

            test('correctly transform operator [$not]', () => {
                const filter = {
                    $not: [ ctx.filter ]
                }

                expect(env.filterParser.parseFilter(filter)).toEqual([{
                    filterExpr: { $not: env.filterParser.parseFilter(ctx.filter)[0].filterExpr }
                }])
            })
        })

        describe('aggregation functions', () => {

            describe('transform select fields', () => {
                test('single id field', () => {
                    const aggregation = {
                        _id: { [ctx.fieldName]: `$${ctx.fieldName}` }
                    }

                    expect(env.filterParser.parseAggregation(aggregation)).toEqual({
                        fieldsStatement: { $group: { _id: { [ctx.fieldName]: `$${ctx.fieldName}` } } },
                        havingFilter: { $match: {} },
                    })
                })

                test('multiple id fields', () => {
                    const aggregation = {
                        _id: {
                            field1: `$${ctx.fieldName}`,
                            field2: `$${ctx.anotherFieldName}`
                        }
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
                        _id: `$${ctx.fieldName}`,
                        [ctx.moreFieldName]: {
                            $avg: `$${ctx.anotherFieldName}`
                        }
                    }

                    const havingFilter = {  [ctx.moreFieldName]: { $gt: ctx.fieldValue } }

                    expect(env.filterParser.parseAggregation(aggregation, havingFilter)).toEqual({
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
                    ['$avg'],
                    ['$min'],
                    ['$max'],
                    ['$sum'],
                ]).test('translate %s function', (wixDataFunction) => {
                    const aggregation = {
                        _id: `$${ctx.fieldName}`,
                        [ctx.moreFieldName]: {
                            [wixDataFunction]: `$${ctx.anotherFieldName}`
                        }
                    }

                    expect(env.filterParser.parseAggregation(aggregation)).toEqual({
                        fieldsStatement: {
                            $group: {
                                _id: {
                                    [ctx.fieldName]: `$${ctx.fieldName}`
                                },
                                [ctx.moreFieldName]: { [wixDataFunction]: `$${ctx.anotherFieldName}` }
                            }
                        },
                        havingFilter: { $match: {} },
                    })
                })

                test('translate $count function', () => {
                    const aggregation = {
                        _id: { [ctx.fieldName]: `$${ctx.fieldName}` },
                        count: { $sum: 1 }
                    }

                    expect(env.filterParser.parseAggregation(aggregation)).toEqual({
                        fieldsStatement: {
                            $group: {
                                _id: {
                                    [ctx.fieldName]: `$${ctx.fieldName}`
                                },
                                count: { $sum: 1 }
                            }
                        },
                        havingFilter: { $match: {} },
                    })
                })
            })

        })

    })

    const ctx = {
        fieldName: Uninitialized,
        fieldValue: Uninitialized,
        fieldListValue: Uninitialized,
        anotherFieldName: Uninitialized,
        moreFieldName: Uninitialized,
        filter: Uninitialized,
        anotherFilter: Uninitialized,
        offset: Uninitialized,
    }

    const env = {
        filterParser: Uninitialized,
    }

    beforeEach(() => {
        ctx.fieldName = chance.word()
        ctx.anotherFieldName = chance.word()
        ctx.moreFieldName = chance.word()

        ctx.fieldValue = chance.word()
        ctx.fieldListValue = [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()]

        ctx.filter = gen.randomFilter()
        ctx.anotherFilter = gen.randomFilter()

        ctx.offset = chance.natural({ min: 2, max: 20 })
    })

    beforeAll(function() {
        env.filterParser = new FilterParser
    })

})
