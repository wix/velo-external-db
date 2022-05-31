const FilterParser = require('./sql_filter_transformer')
const { Uninitialized, gen } = require('@wix-velo/test-commons')
const { InvalidQuery } = require('@wix-velo/velo-external-db-commons').errors
const { AdapterOperators } = require('@wix-velo/velo-external-db-commons')
const { idFilter } = require('../tests/gen')
const each = require('jest-each').default
const Chance = require('chance')
const chance = Chance()
const { eq, gt, gte, include, lt, lte, ne, string_begins, string_contains, and, or, not } = AdapterOperators

describe('Sql Parser', () => {

    describe('filter parser', () => {

        test('handles undefined filter', () => {
            expect( env.filterParser.parseFilter('') ).toEqual([])
            expect( env.filterParser.parseFilter(undefined) ).toEqual([])
            expect( env.filterParser.parseFilter(null) ).toEqual([])
            expect( env.filterParser.parseFilter(555) ).toEqual([])
            expect( env.filterParser.parseFilter([5555]) ).toEqual([])
        })

        test('transform filter', () => {
            const filterExpr = env.filterParser.parseFilter(ctx.filter)[0].filterExpr
            expect( env.filterParser.transform(ctx.filter) ).toEqual({
                filterExpr: {
                    FilterExpression: filterExpr.FilterExpression,
                    ExpressionAttributeNames: filterExpr.ExpressionAttributeNames,
                    ExpressionAttributeValues: filterExpr.ExpressionAttributeValues
                },
                    queryable: false
            })
        })

        test('transform filter on id to query command', () => {
            const filterExpr = env.filterParser.parseFilter(ctx.idFilter)[0].filterExpr
            expect( env.filterParser.transform(ctx.idFilter) ).toEqual({
                filterExpr: {
                    KeyConditionExpression: filterExpr.FilterExpression,
                    ExpressionAttributeNames: filterExpr.ExpressionAttributeNames,
                    ExpressionAttributeValues: filterExpr.ExpressionAttributeValues
                },
                    queryable: true
            })
        })

        describe('handle single field operator', () => {
            each([
                ne, lt, lte, gt, gte, eq,
            ]).test('correctly transform operator [%s]', (o) => {
                const filter = {
                    operator: o,
                    fieldName: ctx.fieldName,
                    value: ctx.fieldValue
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: {
                        FilterExpression: `#${ctx.fieldName} ${env.filterParser.adapterOperatorToDynamoOperator(o, ctx.fieldValue)} :${ctx.fieldName}`,
                        ExpressionAttributeNames: { [`#${ctx.fieldName}`]: ctx.fieldName },
                        ExpressionAttributeValues: { [`:${ctx.fieldName}`]: ctx.fieldValue } 
                    }                     
                }])

            })

            test('correctly extract filter value if value is 0', () => {
                const filter = {
                    operator: eq,
                    fieldName: ctx.fieldName,
                    value: 0
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: {
                        FilterExpression: `#${ctx.fieldName} = :${ctx.fieldName}`,
                        ExpressionAttributeNames: { [`#${ctx.fieldName}`]: ctx.fieldName },
                        ExpressionAttributeValues: { [`:${ctx.fieldName}`]: 0 } 
                    }  
                }])
            })

            test('correctly transform operator [include]', () => {
                const filter = {
                    operator: include,
                    fieldName: ctx.fieldName,
                    value: ctx.fieldListValue
            }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: {
                        FilterExpression: `#${ctx.fieldName} IN (:0, :1, :2, :3, :4)`,
                        ExpressionAttributeNames: { [`#${ctx.fieldName}`]: ctx.fieldName },
                        ExpressionAttributeValues: { ':0': ctx.fieldListValue[0], ':1': ctx.fieldListValue[1], ':2': ctx.fieldListValue[2],
                                                     ':3': ctx.fieldListValue[3], ':4': ctx.fieldListValue[4] } 
                    }
                }])
            })

            test('operator [$hasSome] with empty list of values will throw an exception', () => {
                const filter = {
                    operator: include,
                    fieldName: ctx.fieldName,
                    value: []
                }

                expect( () => env.filterParser.parseFilter(filter) ).toThrow(InvalidQuery)
            })

            test('correctly transform operator [eq] with null value', () => {
                const filter = {
                    operator: eq,
                    fieldName: ctx.fieldName,
                    value: undefined                    
            }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: {
                        FilterExpression: `#${ctx.fieldName} = :${ctx.fieldName}`,
                        ExpressionAttributeNames: { [`#${ctx.fieldName}`]: ctx.fieldName },
                        ExpressionAttributeValues: { [`:${ctx.fieldName}`]: null } 
                    }
                }])

            })

            test('correctly transform operator [eq] with boolean value', () => {
                const value = chance.bool()
                const filter = {
                    operator: eq,
                    fieldName: ctx.fieldName,
                    value: value
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: {
                        FilterExpression: `#${ctx.fieldName} = :${ctx.fieldName}`,
                        ExpressionAttributeNames: { [`#${ctx.fieldName}`]: ctx.fieldName },
                        ExpressionAttributeValues: { [`:${ctx.fieldName}`]: value } 
                    }
                }])

            })

            describe('handle string operators', () => {
                //'$contains', '', ''
                test('correctly transform operator [string_contains]', () => {
                    const filter = {
                        operator: string_contains,
                        fieldName: ctx.fieldName,
                        value: ctx.fieldValue
                    }

                    expect( env.filterParser.parseFilter(filter) ).toEqual([{
                        filterExpr: {
                            FilterExpression: `contains (#${ctx.fieldName}, :${ctx.fieldName})`,
                            ExpressionAttributeNames: { [`#${ctx.fieldName}`]: ctx.fieldName },
                            ExpressionAttributeValues: { [`:${ctx.fieldName}`]: ctx.fieldValue } 
                        }
                    }])

                })

                test('correctly transform operator [$startsWith]', () => {
                    const filter = {
                        operator: string_begins,
                        fieldName: ctx.fieldName,
                        value: ctx.fieldValue
                    }

                    expect( env.filterParser.parseFilter(filter) ).toEqual([{
                        filterExpr: {
                            FilterExpression: `begins_with (#${ctx.fieldName}, :${ctx.fieldName})`,
                            ExpressionAttributeNames: { [`#${ctx.fieldName}`]: ctx.fieldName },
                            ExpressionAttributeValues: { [`:${ctx.fieldName}`]: ctx.fieldValue } 
                        }                    
                    }])

                })
            })
        })

        describe('handle multi field operator', () => {
            each([
                and, or
            ]).test('correctly transform operator [%s]', (o) => {
                const filter = {
                    operator: o,
                    value: [ctx.filter, ctx.anotherFilter]
                }
                const op = o === and ? 'AND' : 'OR'

                const filterExpr = env.filterParser.parseFilter(ctx.filter)[0].filterExpr
                const anotherFilterExpr = env.filterParser.parseFilter(ctx.anotherFilter)[0].filterExpr

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: {
                        FilterExpression: `${filterExpr.FilterExpression} ${op} ${anotherFilterExpr.FilterExpression}`,
                    
                        ExpressionAttributeNames: { ...filterExpr.ExpressionAttributeNames,
                                                    ...anotherFilterExpr.ExpressionAttributeNames                      
                        },
                        ExpressionAttributeValues: { ...filterExpr.ExpressionAttributeValues,
                                                    ...anotherFilterExpr.ExpressionAttributeValues 
                        } 
                    }
                }])
            })

            test('correctly transform operator [not]', () => {
                const filter = {
                    operator: not,
                    value: [ ctx.filter ]
                }

                const filterExpr = env.filterParser.parseFilter(ctx.filter)[0].filterExpr
                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: {
                        FilterExpression: `NOT (${filterExpr.FilterExpression})`,
                        ExpressionAttributeNames: filterExpr.ExpressionAttributeNames,
                        ExpressionAttributeValues: filterExpr.ExpressionAttributeValues,
                    }
                }])
            })
        })

        describe('transform projection', () => {
            test('projection handle single field projection', () => {
                expect(env.filterParser.selectFieldsFor([ctx.fieldName])).toEqual({
                    projectionExpr: `#${ctx.fieldName}`,
                    projectionAttributeNames: { [`#${ctx.fieldName}`]: ctx.fieldName }
                })
            })

            test('projection handle multiple field projection', () => {
                expect(env.filterParser.selectFieldsFor([ctx.fieldName, ctx.anotherFieldName])).toEqual(
                        { 
                            projectionExpr: `#${ctx.fieldName}, #${ctx.anotherFieldName}`,
                            projectionAttributeNames: { [`#${ctx.fieldName}`]: ctx.fieldName, [`#${ctx.anotherFieldName}`]: ctx.anotherFieldName }
                        }
                    )
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
        idFilter: Uninitialized,
        anotherFilter: Uninitialized,
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

        ctx.filter = gen.randomWrappedFilter()
        ctx.idFilter = idFilter()
        ctx.anotherFilter = gen.randomWrappedFilter()
    })

    beforeAll(function() {
        env.filterParser = new FilterParser
    })


})
