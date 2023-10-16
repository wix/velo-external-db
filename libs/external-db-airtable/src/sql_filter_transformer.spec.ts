import FilterParser from './sql_filter_transformer'
import { EmptySort } from './airtable_utils'
import { Uninitialized, gen } from '@wix-velo/test-commons'
import { errors } from '@wix-velo/velo-external-db-commons'
import { AdapterOperators } from '@wix-velo/velo-external-db-commons'
import each from 'jest-each'
import Chance = require('chance')
const { InvalidQuery } = errors
const chance = Chance()
const { eq, gt, gte, include, lt, lte, ne, string_begins, string_ends, string_contains, and, or, not } = AdapterOperators


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
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName, direction: 'asc' }) ).toEqual({ direction: 'asc', field: ctx.fieldName })
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName, direction: 'aSc' }) ).toEqual({ direction: 'asc', field: ctx.fieldName })
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName, direction: 'desc' }) ).toEqual({ direction: 'desc', field: ctx.fieldName })
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName }) ).toEqual({ direction: 'asc', field: ctx.fieldName })
        })

        test('process single sort with valid expression', () => {
            expect( env.filterParser.orderBy([{ fieldName: ctx.fieldName, direction: 'asc' }]) ).toEqual({ sort: [{ direction: 'asc', field: ctx.fieldName }] })
        })

        test('process single sort with two valid expression', () => {
            expect( env.filterParser
                       .orderBy([{ fieldName: ctx.fieldName, direction: 'asc' },
                                 { fieldName: ctx.anotherFieldName, direction: 'desc' }]) ).toEqual({ sort: [{ direction: 'asc', field: ctx.fieldName },
                                                                                                            { direction: 'desc', field: ctx.anotherFieldName }] })
        })

        test('process single sort with one valid and one invalid expression', () => {
            expect( env.filterParser.orderBy([{ fieldName: ctx.fieldName, direction: 'asc' },
                { invalid: 'object' }]) ).toEqual({ sort: [{ direction: 'asc', field: ctx.fieldName }] })
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
                filterExpr: `${env.filterParser.parseFilter(ctx.filter)[0].filterExpr}`,
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

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: `${ctx.fieldName} ${env.filterParser.adapterOperatorToAirtableOperator(o, ctx.fieldValue)} "${ctx.fieldValue}"`,
                }])

            })

            test('correctly extract filter value if value is 0', () => {
                const filter = {
                    operator: eq,
                    fieldName: ctx.fieldName,
                    value: 0
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: `${ctx.fieldName} = "0"`
                }])

            })

            test('correctly transform operator [include]', () => {
                const filter = {
                    operator: include,
                    fieldName: ctx.fieldName,
                    value: ctx.fieldListValue
                }
                
                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: `OR(${ctx.fieldListValue.map((val: any) => `${ctx.fieldName} = "${val}"`)})`
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

            test('correctly transform operator [eq] with null value', () => {
                const filter = {
                    operator: eq,
                    fieldName: ctx.fieldName,
                    value: undefined                    
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: `${ctx.fieldName} = ""`,
                }])

            })

            test('correctly transform operator [eq] with boolean value', () => {
                const value = chance.bool()
                const operator = '$eq'
                const filter = {
                    operator: eq,
                    fieldName: ctx.fieldName,
                    value
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: `${ctx.fieldName} = ${env.filterParser.valueForOperator(value, operator)}`
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
                        filterExpr: `REGEX_MATCH({${ctx.fieldName}},'${ctx.fieldValue}')`
                    }])

                })

                test('correctly transform operator [string_begins]', () => {
                    const filter = {
                        operator: string_begins,
                        fieldName: ctx.fieldName,
                        value: ctx.fieldValue
                    }

                    expect( env.filterParser.parseFilter(filter) ).toEqual([{
                        filterExpr: `REGEX_MATCH({${ctx.fieldName}},'^${ctx.fieldValue}')`
                    }])

                })

                test('correctly transform operator [string_ends]', () => {
                    const filter = {
                        operator: string_ends,
                        fieldName: ctx.fieldName,
                        value: ctx.fieldValue
                    }

                    expect( env.filterParser.parseFilter(filter) ).toEqual([{
                        filterExpr: `REGEX_MATCH({${ctx.fieldName}},'${ctx.fieldValue}$')`
                    }])
                })
            })
        })
        describe('handle multi field operator', () => {
            each([
                and, or
            ]).test('correctly transform operator [%s]', (o: string) => {
                const filter = {
                    operator: o,
                    value: [ctx.filter, ctx.anotherFilter]
                }
                const op = o === and ? 'AND' : 'OR'

                expect( env.filterParser.parseFilter(filter) ).toEqual(
                    [{
                    filterExpr: `${op}(${env.filterParser.parseFilter(ctx.filter)[0].filterExpr},${env.filterParser.parseFilter(ctx.anotherFilter)[0].filterExpr})`                
                }]
                )
            })

            test('correctly transform operator [not]', () => {
                const filter = {
                    operator: not,
                    value: [ ctx.filter ]
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: `NOT(${env.filterParser.parseFilter(ctx.filter)[0].filterExpr})`,
                }])
            })
        })

    })

    interface Context {
        fieldName: any
        fieldValue: any
        fieldListValue: any
        anotherFieldName: any
        moreFieldName: any
        filter: any
        anotherFilter: any
    }

    const ctx: Context= {
        fieldName: Uninitialized,
        fieldValue: Uninitialized,
        fieldListValue: Uninitialized,
        anotherFieldName: Uninitialized,
        moreFieldName: Uninitialized,
        filter: Uninitialized,
        anotherFilter: Uninitialized,
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
        ctx.fieldListValue = [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()]

        ctx.filter = gen.randomWrappedFilter()
        ctx.anotherFilter = gen.randomWrappedFilter()
    })

    beforeAll(function() {
        env.filterParser = new FilterParser
    })


})
