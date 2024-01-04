import * as Chance from 'chance'
import each from 'jest-each'
import { EmptySort, AdapterOperators,  errors } from '@wix-velo/velo-external-db-commons'
import { Uninitialized, gen } from '@wix-velo/test-commons'
import FilterParser from './sql_filter_transformer'
import { escapeIdentifier as escapeId, escapeIdentifier } from './bigquery_utils'
import { AdapterOperator, AdapterFunctions } from '@wix-velo/velo-external-db-types'
const { InvalidQuery } = errors
const chance = Chance()
const { eq, gt, gte, include, lt, lte, ne, string_begins, string_ends, string_contains, and, or, not, urlized, matches } = AdapterOperators as Record<string, AdapterOperator>
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
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect( env.filterParser.parseSort({ }) ).toEqual([])
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect( env.filterParser.parseSort({ invalid: 'object' }) ).toEqual([])

        })

        test('process single sort expression', () => {
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName, direction: 'asc' }) ).toEqual([{ expr: `${escapeId(ctx.fieldName)} ASC` }])
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName, direction: 'aSc' }) ).toEqual([{ expr: `${escapeId(ctx.fieldName)} ASC` }])
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName, direction: 'desc' }) ).toEqual([{ expr: `${escapeId(ctx.fieldName)} DESC` }])
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName }) ).toEqual([{ expr: `${escapeId(ctx.fieldName)} ASC` }])
        })

        test('process single sort with valid expression', () => {
            expect( env.filterParser.orderBy([{ fieldName: ctx.fieldName, direction: 'asc' }]) ).toEqual({ sortExpr: `ORDER BY ${escapeId(ctx.fieldName)} ASC` })
        })

        test('process single sort with two valid expression', () => {
            expect( env.filterParser
                       .orderBy([{ fieldName: ctx.fieldName, direction: 'asc' },
                                 { fieldName: ctx.anotherFieldName, direction: 'desc' }]) ).toEqual({ sortExpr: `ORDER BY ${escapeId(ctx.fieldName)} ASC, ${escapeId(ctx.anotherFieldName)} DESC` })
        })

        test('process single sort with one valid and one invalid expression', () => {
            expect( env.filterParser.orderBy([{ fieldName: ctx.fieldName, direction: 'asc' },
                { invalid: 'object' }]) ).toEqual({ sortExpr: `ORDER BY ${escapeId(ctx.fieldName)} ASC` })
        })
    })


    describe('filter parser', () => {

        test('handles undefined filter', () => {
            // @ts-ignore
            expect( env.filterParser.parseFilter('') ).toEqual([])
            // @ts-ignore
            expect( env.filterParser.parseFilter(undefined) ).toEqual([])
            // @ts-ignore
            expect( env.filterParser.parseFilter(null) ).toEqual([])
            // @ts-ignore
            expect( env.filterParser.parseFilter(555) ).toEqual([])
            // @ts-ignore
            expect( env.filterParser.parseFilter([5555]) ).toEqual([])
        })


        test('transform filter', () => {
            expect( env.filterParser.transform(ctx.filter) ).toEqual({
                filterExpr: `WHERE ${env.filterParser.parseFilter(ctx.filter)[0].filterExpr}`,
                parameters: env.filterParser.parseFilter(ctx.filter)[0].parameters
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
                    filterExpr: `${escapeId(ctx.fieldName)} ${env.filterParser.adapterOperatorToMySqlOperator(o, ctx.fieldValue)} ?`,
                    parameters: [ctx.fieldValue]
                }])

            })

            test('correctly extract filter value if value is 0', () => {
                const filter = {
                    operator: eq,
                    fieldName: ctx.fieldName,
                    value: 0
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: `${escapeId(ctx.fieldName)} = ?`,
                    parameters: [0]
                }])

            })
            
            test('operator [include] with empty list of values will throw an exception', () => {
                const filter = {
                    operator: include,
                    fieldName: ctx.fieldName,
                    value: []
                }

                expect( () => env.filterParser.parseFilter(filter) ).toThrow(InvalidQuery)
            })

            test('correctly transform operator [include]', () => {
                const filter = {
                    operator: include,
                    fieldName: ctx.fieldName,
                    value: ctx.fieldListValue
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: `${escapeId(ctx.fieldName)} IN UNNEST(?)`,
                    parameters: [ctx.fieldListValue]
                }])
            })

            each([
                undefined, null
            ]).test('correctly transform operator [eq] with null value [%s]', (value) => {
                const filter = {
                    operator: eq,
                    fieldName: ctx.fieldName,
                    value
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: `${escapeId(ctx.fieldName)} IS NULL`,
                    parameters: []
                }])

            })

            each([
                undefined, null
            ]).test('correctly transform operator [ne] with null value [%s]', (value) => {
                const filter = {
                    operator: ne,
                    fieldName: ctx.fieldName,
                    value
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: `${escapeId(ctx.fieldName)} IS NOT NULL`,
                    parameters: []
                }])

            })

            test('correctly transform operator [$eq] with boolean value', () => {
                const value = chance.bool()
                const filter = {
                    operator: eq,
                    fieldName: ctx.fieldName,
                    value
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: `${escapeId(ctx.fieldName)} = ?`,
                    parameters: [value ? 1 : 0]
                }])
            })

        })

            describe('handle string operators', () => {
                test('correctly transform operator [string_contains]', () => {
                    const filter = {
                        operator: string_contains,
                        fieldName: ctx.fieldName,
                        value: ctx.fieldValue
                    }

                    expect( env.filterParser.parseFilter(filter) ).toEqual([{
                        filterExpr: `LOWER(${escapeId(ctx.fieldName)}) LIKE LOWER(?)`,
                        parameters: [`%${ctx.fieldValue}%`]
                    }])
                })

                test('correctly transform operator [string_begins]', () => {
                    const filter = {
                        operator: string_begins,
                        fieldName: ctx.fieldName,
                        value: ctx.fieldValue
                    }

                    expect( env.filterParser.parseFilter(filter) ).toEqual([{
                        filterExpr: `LOWER(${escapeId(ctx.fieldName)}) LIKE LOWER(?)`,
                        parameters: [`${ctx.fieldValue}%`]
                    }])
                })

                test('correctly transform operator [string_ends]', () => {
                    const filter = {
                        operator: string_ends,
                        fieldName: ctx.fieldName,
                        value: ctx.fieldValue
                    }

                    expect( env.filterParser.parseFilter(filter) ).toEqual([{
                        filterExpr: `LOWER(${escapeId(ctx.fieldName)}) LIKE LOWER(?)`,
                        parameters: [`%${ctx.fieldValue}`]
                    }])
                })

                test('correctly transform operator [urlized]', () => {
                    const filter = {
                        operator: urlized,
                        fieldName: ctx.fieldName,
                        value: ctx.fieldListValue
                    }

                    expect( env.filterParser.parseFilter(filter) ).toEqual([{
                        filterExpr: `LOWER(${escapeId(ctx.fieldName)}) RLIKE ?`,
                        parameters: [ctx.fieldListValue.map((s: string) => s.toLowerCase()).join('[- ]')]
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

                    expect( env.filterParser.parseFilter(filter) ).toEqual([{
                        filterExpr: `REGEXP_CONTAINS(LOWER(${escapeId(ctx.fieldName)}), LOWER(?))`,
                        parameters: [`${ctx.fieldValue}[${ctx.anotherValue}]${ctx.moreValue}`]
                    }])   
                })
                
                test('correctly transform operator [matches] without ignoreCase', () => {
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

                    expect( env.filterParser.parseFilter(filter) ).toEqual([{
                        filterExpr: `REGEXP_CONTAINS((${escapeId(ctx.fieldName)}), (?))`,
                        parameters: [`${ctx.fieldValue}[${ctx.anotherValue}]${ctx.moreValue}`]
                    }])   
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
                        filterExpr: `JSON_VALUE(${ctx.fieldName}.${ctx.nestedFieldName}.${ctx.anotherNestedFieldName}) ${env.filterParser.adapterOperatorToMySqlOperator(operator, ctx.filterWithoutInclude.value)} ?`,
                        parameters: [ctx.filterWithoutInclude.value].flat()
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

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: `(${env.filterParser.parseFilter(ctx.filter)[0].filterExpr} ${op} ${env.filterParser.parseFilter(ctx.anotherFilter)[0].filterExpr})`,
                    parameters: [].concat(env.filterParser.parseFilter(ctx.filter)[0].parameters)
                                  .concat(env.filterParser.parseFilter(ctx.anotherFilter)[0].parameters)
                }])
            })

            test('correctly transform operator [not]', () => {
                const filter = {
                    operator: not,
                    value: [ ctx.filter ]
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: `NOT (${env.filterParser.parseFilter(ctx.filter)[0].filterExpr})`,
                    parameters: env.filterParser.parseFilter(ctx.filter)[0].parameters
                }])
            })
        })

        describe('transform projection', () => {
            test('projection handle single field projection', () => {
                expect(env.filterParser.selectFieldsFor([ctx.fieldName])).toEqual(`${escapeIdentifier(ctx.fieldName)}`)
            })

            test('projection handle multiple field projection', () => {
                expect(env.filterParser.selectFieldsFor([ctx.fieldName, ctx.anotherFieldName])).toEqual(
                    `${escapeIdentifier(ctx.fieldName)}, ${escapeIdentifier(ctx.anotherFieldName)}`
                    )
            })
        })


        describe('aggregation functions', () => {

            describe('transform select fields', () => {
                test('single id field', () => {
                    const aggregation = {
                        projection: [{ name: ctx.fieldName }]
                    }

                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    expect( env.filterParser.parseAggregation(aggregation) ).toEqual({
                        fieldsStatement: escapeId(ctx.fieldName),
                        groupByColumns: [ctx.fieldName],
                        havingFilter: '',
                        parameters: []
                    })
                })

                test('multiple id fields', () => {
                    const aggregation = {
                        projection: [
                            { name: ctx.fieldName },
                            { name: ctx.anotherFieldName }
                           ]
                     }

                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    expect( env.filterParser.parseAggregation(aggregation) ).toEqual({
                        fieldsStatement: `${escapeId(ctx.fieldName)}, ${escapeId(ctx.anotherFieldName)}`,
                        groupByColumns: [ctx.fieldName, ctx.anotherFieldName],
                        havingFilter: '',
                        parameters: [],
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

                    const havingFilter = { [ctx.moreFieldName]: { $gt: ctx.fieldValue } }

                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    expect( env.filterParser.parseAggregation(aggregation, havingFilter) ).toEqual({
                        fieldsStatement: `${escapeId(ctx.fieldName)}, CAST(AVG(${escapeId(ctx.anotherFieldName)}) AS FLOAT64) AS ${escapeId(ctx.moreFieldName)}`,
                        groupByColumns: [ctx.fieldName],
                        havingFilter: `HAVING ${escapeId(ctx.moreFieldName)} > ?`,
                        parameters: [ctx.fieldValue],
                    })
                })

                each([
                    ['AVG', avg],
                    ['MIN', min],
                    ['MAX', max],
                    ['SUM', sum],
                ]).test('translate %s function', (mySqlFunction, adapterFunction) => {
                    const aggregation = {
                        projection: [
                            { name: ctx.fieldName },
                            { name: ctx.anotherFieldName, function: adapterFunction, alias: ctx.moreFieldName }
                        ]
                    }

                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    expect( env.filterParser.parseAggregation(aggregation) ).toEqual({
                        fieldsStatement: `${escapeId(ctx.fieldName)}, CAST(${mySqlFunction}(${escapeId(ctx.anotherFieldName)}) AS FLOAT64) AS ${escapeId(ctx.moreFieldName)}`,
                        groupByColumns: [ctx.fieldName],
                        havingFilter: '',
                        parameters: [],
                    })
                })

                test('translate COUNT function', () => {
                    const aggregation = {
                        projection: [
                            { name: ctx.fieldName },
                            { name: '*', alias: ctx.moreFieldName, function: count }
                        ]
                    }
                    
                    //  eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    expect(env.filterParser.parseAggregation(aggregation) ).toEqual({
                        fieldsStatement: `${escapeId(ctx.fieldName)}, CAST(COUNT(*) AS FLOAT64) AS ${escapeId(ctx.moreFieldName)}`,
                        groupByColumns: [ctx.fieldName],
                        havingFilter: '',
                        parameters: [],
                    })
                })
            })

        })

    })

    const ctx = {
        fieldName: Uninitialized,
        fieldValue: Uninitialized,
        anotherValue: Uninitialized,
        moreValue: Uninitialized,
        nestedFieldName: Uninitialized,
        anotherNestedFieldName: Uninitialized,
        fieldListValue: Uninitialized,
        anotherFieldName: Uninitialized,
        moreFieldName: Uninitialized,
        filter: Uninitialized,
        anotherFilter: Uninitialized,
        filterWithoutInclude: Uninitialized,
    }

    const env: {
        filterParser: FilterParser,
    }= {
        filterParser: Uninitialized,
    }

    beforeEach(() => {
        ctx.fieldName = chance.word()
        ctx.anotherFieldName = chance.word()
        ctx.moreFieldName = chance.word()
        ctx.nestedFieldName = chance.word()
        ctx.anotherNestedFieldName = chance.word()

        ctx.fieldValue = chance.word()
        ctx.anotherValue = chance.word()
        ctx.moreValue = chance.word()
        ctx.fieldListValue = [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()]

        ctx.filter = gen.randomWrappedFilter()
        ctx.anotherFilter = gen.randomWrappedFilter()
        ctx.filterWithoutInclude = gen.randomDomainFilterWithoutInclude()
        
    })

    beforeAll(function() {
        env.filterParser = new FilterParser
    })


})
