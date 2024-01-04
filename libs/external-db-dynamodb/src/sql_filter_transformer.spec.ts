import FilterParser from './sql_filter_transformer'
import { Uninitialized, gen } from '@wix-velo/test-commons'
import { errors } from '@wix-velo/velo-external-db-commons'
import { AdapterOperators } from '@wix-velo/velo-external-db-commons'
import { idFilter } from '../tests/gen'
import each from 'jest-each'
import * as Chance from 'chance' 
import { AdapterOperator } from '@wix-velo/velo-external-db-types'
const { InvalidQuery } = errors
const chance = Chance()
const { eq, gt, gte, include, lt, lte, ne, string_begins, string_contains, and, or, not } = AdapterOperators as Record<string, AdapterOperator>

describe('Sql Parser', () => {

    describe('filter parser', () => {

        test('handles undefined filter', () => {
            //@ts-ignore
            expect( env.filterParser.parseFilter('') ).toEqual([])
            //@ts-ignore
            expect( env.filterParser.parseFilter(undefined) ).toEqual([])
            //@ts-ignore
            expect( env.filterParser.parseFilter(null) ).toEqual([])
            //@ts-ignore
            expect( env.filterParser.parseFilter(555) ).toEqual([])
            //@ts-ignore
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

        
        test('transform filter id filter with equal operator to query command', () => {
            const filter = {
                fieldName: '_id',
                operator: eq,
                value: ctx.fieldValue
            }
            const filterExpr = env.filterParser.parseFilter(filter)[0].filterExpr
            expect( env.filterParser.transform(filter) ).toEqual({
                filterExpr: {
                    KeyConditionExpression: filterExpr.FilterExpression,
                    ExpressionAttributeNames: filterExpr.ExpressionAttributeNames,
                    ExpressionAttributeValues: filterExpr.ExpressionAttributeValues
                },
                    queryable: true
            })
        })

        test('filter on id with any other operator but equal shouldn\'t transform to query', () => {
            const filterExpr = env.filterParser.parseFilter(ctx.idFilterNotEqual)[0].filterExpr
            expect( env.filterParser.transform(ctx.idFilterNotEqual) ).toEqual({
                filterExpr: {
                    FilterExpression: filterExpr.FilterExpression,
                    ExpressionAttributeNames: filterExpr.ExpressionAttributeNames,
                    ExpressionAttributeValues: filterExpr.ExpressionAttributeValues
                },
                    queryable: false
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
                        FilterExpression: `#${ctx.fieldName}0 ${env.filterParser.adapterOperatorToDynamoOperator(o)} :${ctx.fieldName}0`,
                        ExpressionAttributeNames: { [`#${ctx.fieldName}0`]: ctx.fieldName },
                        ExpressionAttributeValues: { [`:${ctx.fieldName}0`]: ctx.fieldValue } 
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
                        FilterExpression: `#${ctx.fieldName}0 = :${ctx.fieldName}0`,
                        ExpressionAttributeNames: { [`#${ctx.fieldName}0`]: ctx.fieldName },
                        ExpressionAttributeValues: { [`:${ctx.fieldName}0`]: 0 } 
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
                        FilterExpression: `#${ctx.fieldName}0 IN (:${ctx.fieldName}0, :${ctx.fieldName}1, :${ctx.fieldName}2, :${ctx.fieldName}3, :${ctx.fieldName}4)`,
                        ExpressionAttributeNames: { [`#${ctx.fieldName}0`]: ctx.fieldName },
                        ExpressionAttributeValues: { [`:${ctx.fieldName}0`]: ctx.fieldListValue[0], [`:${ctx.fieldName}1`]: ctx.fieldListValue[1], [`:${ctx.fieldName}2`]: ctx.fieldListValue[2],
                                                     [`:${ctx.fieldName}3`]: ctx.fieldListValue[3], [`:${ctx.fieldName}4`]: ctx.fieldListValue[4] } 
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
                        FilterExpression: `#${ctx.fieldName}0 = :${ctx.fieldName}0`,
                        ExpressionAttributeNames: { [`#${ctx.fieldName}0`]: ctx.fieldName },
                        ExpressionAttributeValues: { [`:${ctx.fieldName}0`]: null } 
                    }
                }])

            })

            test('correctly transform operator [eq] with boolean value', () => {
                const value = chance.bool()
                const filter = {
                    operator: eq,
                    fieldName: ctx.fieldName,
                    value
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: {
                        FilterExpression: `#${ctx.fieldName}0 = :${ctx.fieldName}0`,
                        ExpressionAttributeNames: { [`#${ctx.fieldName}0`]: ctx.fieldName },
                        ExpressionAttributeValues: { [`:${ctx.fieldName}0`]: value } 
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
                            FilterExpression: `contains (#${ctx.fieldName}0, :${ctx.fieldName}0)`,
                            ExpressionAttributeNames: { [`#${ctx.fieldName}0`]: ctx.fieldName },
                            ExpressionAttributeValues: { [`:${ctx.fieldName}0`]: ctx.fieldValue } 
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
                            FilterExpression: `begins_with (#${ctx.fieldName}0, :${ctx.fieldName}0)`,
                            ExpressionAttributeNames: { [`#${ctx.fieldName}0`]: ctx.fieldName },
                            ExpressionAttributeValues: { [`:${ctx.fieldName}0`]: ctx.fieldValue } 
                        }                    
                    }])

                })
            })
        })

        describe('handle queries on nested fields', () => {
            test('correctly transform nested field query', () => {
                const operator = ctx.filterWithoutInclude.operator
                const filter = {
                    operator,
                    fieldName: `${ctx.fieldName}.${ctx.nestedFieldName}.${ctx.anotherNestedFieldName}`,
                    value: ctx.filterWithoutInclude.value
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: {
                        FilterExpression: `#${ctx.fieldName}0.#${ctx.nestedFieldName}1.#${ctx.anotherNestedFieldName}2 ${env.filterParser.adapterOperatorToDynamoOperator(operator)} :${ctx.fieldName}0`,
                        ExpressionAttributeNames: {
                            [`#${ctx.fieldName}0`]: ctx.fieldName,
                            [`#${ctx.nestedFieldName}1`]: ctx.nestedFieldName,
                            [`#${ctx.anotherNestedFieldName}2`]: ctx.anotherNestedFieldName
                        },
                        ExpressionAttributeValues: { [`:${ctx.fieldName}0`]: ctx.filterWithoutInclude.value }
                    }
                }])
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

                const counter = { nameCounter: 0, valueCounter: 0 }
                const filterExpr = env.filterParser.parseFilter(ctx.filter, counter)[0].filterExpr
                const anotherFilterExpr = env.filterParser.parseFilter(ctx.anotherFilter, counter)[0].filterExpr

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: {
                        FilterExpression: `(${filterExpr.FilterExpression} ${op} ${anotherFilterExpr.FilterExpression})`,
                    
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
        nestedFieldName: Uninitialized,
        anotherNestedFieldName: Uninitialized,
        filter: Uninitialized,
        idFilterNotEqual: Uninitialized,
        anotherFilter: Uninitialized,
        filterWithoutInclude: Uninitialized,

    }


    const env: {
        filterParser: FilterParser
    } = {
        filterParser: Uninitialized,
    }

    beforeEach(() => {
        ctx.fieldName = chance.word()
        ctx.anotherFieldName = chance.word()
        ctx.moreFieldName = chance.word()
        ctx.nestedFieldName = chance.word()
        ctx.anotherNestedFieldName = chance.word()

        ctx.fieldValue = chance.word()
        ctx.fieldListValue = [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()]

        ctx.filter = gen.randomWrappedFilter()
        ctx.idFilterNotEqual = idFilter({ withoutEqual: true })
        ctx.anotherFilter = gen.randomWrappedFilter()
        ctx.filterWithoutInclude = gen.randomDomainFilterWithoutInclude()
    })

    beforeAll(function() {
        env.filterParser = new FilterParser
    })


})
