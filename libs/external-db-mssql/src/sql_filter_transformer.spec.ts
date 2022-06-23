import FilterParser from './sql_filter_transformer'
import { EmptySort, AdapterOperators, AdapterFunctions } from '@wix-velo/velo-external-db-commons'
import { escapeId, validateLiteral, patchFieldName } from './mssql_utils'
import { Uninitialized, gen } from '@wix-velo/test-commons'
import { errors } from '@wix-velo/velo-external-db-commons'
import each from 'jest-each'
import * as Chance from 'chance'
const { InvalidQuery } = errors
const chance = Chance()
const { eq, gt, gte, include, lt, lte, ne, string_begins, string_ends, string_contains, and, or, not, urlized, matches } = AdapterOperators
const { avg, max, min, sum, count } = AdapterFunctions

describe('Sql Parser', () => {

    describe('sort parser', () => {

        // todo: should we even check for valid input or should we let the validation library to handle this ?
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
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName, direction: 'asc' }) ).toEqual([{ expr: `${escapeId(ctx.fieldName)} ASC` }])
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName, direction: 'aSc' }) ).toEqual([{ expr: `${escapeId(ctx.fieldName)} ASC` }])
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName, direction: 'desc' }) ).toEqual([{ expr: `${escapeId(ctx.fieldName)} DESC` }])
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName }) ).toEqual([{ expr: `${escapeId(ctx.fieldName)} ASC` }])
        })

        test('process single sort with valid expression', () => {
            expect( env.filterParser.orderBy([{ fieldName: ctx.fieldName, direction: 'asc' }]) ).toEqual({ sortExpr: `ORDER BY ${escapeId(ctx.fieldName)} ASC` })
        })

        test('process single sort with two valid expression', () => {
            expect( env.filterParser.orderBy([{ fieldName: ctx.fieldName, direction: 'asc' },
                { fieldName: ctx.anotherFieldName, direction: 'desc' }]) ).toEqual({ sortExpr: `ORDER BY ${escapeId(ctx.fieldName)} ASC, ${escapeId(ctx.anotherFieldName)} DESC` })
        })

        test('process single sort with one valid and one invalid expression', () => {
            expect( env.filterParser.orderBy([{ fieldName: ctx.fieldName, direction: 'asc' },
                { invalid: 'object' }]) ).toEqual({ sortExpr: `ORDER BY ${escapeId(ctx.fieldName)} ASC` })
        })
    })


    describe('filter parser', () => {

        test('handles undefined filter', () => {
            expect( env.filterParser.parseFilter('') ).toEqual([])
            expect( env.filterParser.parseFilter(undefined) ).toEqual([])
            expect( env.filterParser.parseFilter(null) ).toEqual([])
            expect( env.filterParser.parseFilter(555) ).toEqual([])
            expect( env.filterParser.parseFilter([5555]) ).toEqual([])
        })

        test('transform filter', () => {
            expect( env.filterParser.transform(ctx.filter) ).toEqual({
                filterExpr: `WHERE ${env.filterParser.parseFilter(ctx.filter, 1)[0].filterExpr}`,
                parameters: env.filterParser.parseFilter(ctx.filter, 1)[0].parameters
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
                    filterExpr: `${escapeId(ctx.fieldName)} ${env.filterParser.adapterOperatorToMySqlOperator(o, ctx.fieldValue)} ${validateLiteral(ctx.fieldName)}`,
                    parameters: { [patchFieldName(ctx.fieldName)]: ctx.fieldValue }
                }])

            })

            test('correctly extract filter value if value is 0', () => {
                const filter = {
                    operator: eq,
                    fieldName: ctx.fieldName,
                    value: 0
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: `${escapeId(ctx.fieldName)} = ${validateLiteral(ctx.fieldName)}`,
                    parameters: { [patchFieldName(ctx.fieldName)]: 0 }
                }])

            })

            // todo: $hasAll ???
            test('correctly transform operator [include]', () => {
                const filter = {
                    operator: include,
                    fieldName: ctx.fieldName,
                    value: ctx.fieldListValue
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: `${escapeId(ctx.fieldName)} IN (${validateLiteral(ctx.fieldName)}1, ${validateLiteral(ctx.fieldName)}2, ${validateLiteral(ctx.fieldName)}3, ${validateLiteral(ctx.fieldName)}4, ${validateLiteral(ctx.fieldName)}5)`,
                    parameters: {
                        [`${patchFieldName(ctx.fieldName)}1`]: ctx.fieldListValue[0],
                        [`${patchFieldName(ctx.fieldName)}2`]: ctx.fieldListValue[1],
                        [`${patchFieldName(ctx.fieldName)}3`]: ctx.fieldListValue[2],
                        [`${patchFieldName(ctx.fieldName)}4`]: ctx.fieldListValue[3],
                        [`${patchFieldName(ctx.fieldName)}5`]: ctx.fieldListValue[4],
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

            each([
                undefined, null
            ]).test('correctly transform operator [$eq] with null value [%s]', (value) => {
                const filter = {
                    operator: eq,
                    fieldName: ctx.fieldName,
                    value
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: `${escapeId(ctx.fieldName)} IS NULL`,
                    parameters: { }
                }])
            })

            each([
                undefined, null
            ]).test('correctly transform operator [$ne] with null value [%s]', (value) => {
                const filter = {
                    operator: ne,
                    fieldName: ctx.fieldName,
                    value
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: `${escapeId(ctx.fieldName)} IS NOT NULL`,
                    parameters: { }
                }])
            })

            test('correctly transform operator [$eq] with boolean value', () => {
                const value = chance.bool()
                const filter = {
                    operator: eq,
                    fieldName: ctx.fieldName,
                    value: value
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: `${escapeId(ctx.fieldName)} = ${validateLiteral(ctx.fieldName)}`,
                    parameters: { [patchFieldName(ctx.fieldName)]: value ? 1 : 0 }
                }])
            })

            describe('handle string operators', () => {
                test('correctly transform operator [string_contains]', () => {
                    const filter = {
                        operator: string_contains,
                        fieldName: ctx.fieldName,
                        value: ctx.fieldValue
                    }

                    expect( env.filterParser.parseFilter(filter) ).toEqual([{
                        filterExpr: `${escapeId(ctx.fieldName)} LIKE ${validateLiteral(ctx.fieldName)}`,
                        parameters: { [patchFieldName(ctx.fieldName)]: `%${ctx.fieldValue}%` }
                    }])
                })

                test('correctly transform operator [string_begins]', () => {
                    const filter = {
                        operator: string_begins,
                        fieldName: ctx.fieldName,
                        value: ctx.fieldValue
                    }

                    expect( env.filterParser.parseFilter(filter) ).toEqual([{
                        filterExpr: `${escapeId(ctx.fieldName)} LIKE ${validateLiteral(ctx.fieldName)}`,
                        parameters: { [patchFieldName(ctx.fieldName)]: `${ctx.fieldValue}%` }
                    }])
                })

                test('correctly transform operator [string_ends]', () => {
                    const filter = {
                        operator: string_ends,
                        fieldName: ctx.fieldName,
                        value: ctx.fieldValue
                    }

                    expect( env.filterParser.parseFilter(filter) ).toEqual([{
                        filterExpr: `${escapeId(ctx.fieldName)} LIKE ${validateLiteral(ctx.fieldName)}`,
                        parameters: { [patchFieldName(ctx.fieldName)]: `%${ctx.fieldValue}` }
                    }])
                })

                test('correctly transform operator [urlized]', () => {
                    const filter = {
                        operator: urlized,
                        fieldName: ctx.fieldName,
                        value: ctx.fieldListValue
                    }

                    expect( env.filterParser.parseFilter(filter) ).toEqual([{
                        filterExpr: `LOWER(${escapeId(ctx.fieldName)}) LIKE ${validateLiteral(ctx.fieldName)}`,
                        parameters: { [patchFieldName(ctx.fieldName)]: ctx.fieldListValue.map((s: string) => s.toLowerCase()).join('[- ]') }
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
                        filterExpr: `LOWER(${escapeId(ctx.fieldName)}) LIKE LOWER(${validateLiteral(ctx.fieldName)})`,
                        parameters: { [patchFieldName(ctx.fieldName)]: `${ctx.fieldValue}[${ctx.anotherValue}]${ctx.moreValue}` }
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
                        filterExpr: `(${escapeId(ctx.fieldName)}) LIKE (${validateLiteral(ctx.fieldName)})`,
                        parameters: { [patchFieldName(ctx.fieldName)]: `${ctx.fieldValue}[${ctx.anotherValue}]${ctx.moreValue}` }
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

                const filter1 = env.filterParser.parseFilter(ctx.filter)[0]
                const filter2 = env.filterParser.parseFilter(ctx.anotherFilter)[0]
                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: `${filter1.filterExpr} ${op} ${filter2.filterExpr}`,
                    parameters: { ...filter1.parameters, ...filter2.parameters }
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
                expect(env.filterParser.selectFieldsFor([ctx.fieldName])).toEqual(`${escapeId(ctx.fieldName)}`)
            })

            test('projection handle multiple field projection', () => {
                expect(env.filterParser.selectFieldsFor([ctx.fieldName, ctx.anotherFieldName])).toEqual(
                    `${escapeId(ctx.fieldName)}, ${escapeId(ctx.anotherFieldName)}`
                    )
            })
        })

        describe('aggregation functions', () => {

            describe('transform select fields', () => {
                test('single id field', () => {
                    const aggregation = {
                        projection: [{ name: ctx.fieldName }]
                    }

                    expect( env.filterParser.parseAggregation(aggregation) ).toEqual({
                        fieldsStatement: escapeId(ctx.fieldName),
                        groupByColumns: [ctx.fieldName],
                        havingFilter: '',
                        parameters: { }
                    })
                })

                test('multiple id fields', () => {
                    const aggregation = {
                        projection: [
                            { name: ctx.fieldName },
                            { name: ctx.anotherFieldName }
                           ]
                     }

                    expect( env.filterParser.parseAggregation(aggregation) ).toEqual({
                        fieldsStatement: `${escapeId(ctx.fieldName)}, ${escapeId(ctx.anotherFieldName)}`,
                        groupByColumns: [ctx.fieldName, ctx.anotherFieldName],
                        havingFilter: '',
                        parameters: {},
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

                    expect( env.filterParser.parseAggregation(aggregation) ).toEqual({
                        fieldsStatement: `${escapeId(ctx.fieldName)}, AVG(${escapeId(ctx.anotherFieldName)}) AS ${escapeId(ctx.moreFieldName)}`,
                        groupByColumns: [ctx.fieldName],
                        havingFilter: `HAVING AVG(${escapeId(ctx.anotherFieldName)}) > ${validateLiteral(ctx.moreFieldName)}`,
                        parameters: { [patchFieldName(ctx.moreFieldName)]: ctx.fieldValue },
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

                    expect( env.filterParser.parseAggregation(aggregation) ).toEqual({
                        fieldsStatement: `${escapeId(ctx.fieldName)}, ${mySqlFunction}(${escapeId(ctx.anotherFieldName)}) AS ${escapeId(ctx.moreFieldName)}`,
                        groupByColumns: [ctx.fieldName],
                        havingFilter: '',
                        parameters: {},
                    })
                })

                test('translate COUNT function', () => {
                    const aggregation = {
                        projection: [
                            { name: ctx.fieldName },
                            { name: '*', alias: ctx.moreFieldName, function: count }
                        ]
                    }

                    expect( env.filterParser.parseAggregation(aggregation) ).toEqual({
                        fieldsStatement: `${escapeId(ctx.fieldName)}, COUNT(*) AS ${escapeId(ctx.moreFieldName)}`,
                        groupByColumns: [ctx.fieldName],
                        havingFilter: '',
                        parameters: {},
                    })
                })
            })

        })

    })

    interface Context {
        fieldName: any
        fieldValue: any
        anotherValue: any
        moreValue: any
        fieldListValue: any
        anotherFieldName: any
        moreFieldName: any
        filter: any
        anotherFilter: any
        offset: any
    }

    const ctx: Context = {
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
    }

    interface Enviorment {
        filterParser: any
    }

    const env: Enviorment = {
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
    })

    beforeAll(function() {
        env.filterParser = new FilterParser
    })
})