const FilterParser = require('./sql_filter_transformer')
const { EMPTY_SORT } = require ('./airtable_utils')
const { Uninitialized, gen } = require('test-commons')
const { InvalidQuery } = require('velo-external-db-commons').errors
const each = require('jest-each').default
const Chance = require('chance')
const chance = Chance()

describe('Sql Parser', () => {
    describe('sort parser', () => {

        // todo: should we even check for valid input or should we let the validation library to handle this ?
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
                '$ne', '$lt', '$lte', '$gt', '$gte', '$eq',
            ]).test('correctly transform operator [%s]', (o) => {
                const filter = {
                    [ctx.fieldName]: { [o]: ctx.fieldValue }
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: `${ctx.fieldName} ${env.filterParser.veloOperatorToAirtableOperator(o, ctx.fieldValue)} "${ctx.fieldValue}"`,
                }])

            })

            test('correctly extract filter value if value is 0', () => {
                const filter = {
                    [ctx.fieldName]: { $eq: 0 }
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: `${ctx.fieldName} = "0"`
                }])

            })

            // todo: $hasAll ???
            test('correctly transform operator [$hasSome]', () => {
                const filter = {
                    [ctx.fieldName]: { $hasSome: ctx.fieldListValue }
                }
                
                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: `OR(${ctx.fieldListValue.map(val => `${ctx.fieldName} = "${val}"`)})`
                }])
            })

            test('operator [$hasSome] with empty list of values will throw an exception', () => {
                const filter = {
                    [ctx.fieldName]: { $hasSome: [] }
                }

                expect( () => env.filterParser.parseFilter(filter) ).toThrow(InvalidQuery)
            })

            test('correctly transform operator [$eq] with null value', () => {
                const filter = {
                    [ctx.fieldName]: { $eq: undefined } 
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: `${ctx.fieldName} = ""`,
                }])

            })

            test('correctly transform operator [$eq] with boolean value', () => {
                const value = chance.bool()
                const operator = '$eq'
                const filter = {
                    [ctx.fieldName]: { [operator]: value } 
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: `${ctx.fieldName} = ${env.filterParser.valueForOperator(value, operator)}`
                }])

            })

            describe('handle string operators', () => {
                test('correctly transform operator [$contains]', () => {
                    const filter = {
                        [ctx.fieldName]: { $contains: ctx.fieldValue }
                    }

                    expect( env.filterParser.parseFilter(filter) ).toEqual([{
                        filterExpr: `REGEX_MATCH({${ctx.fieldName}},'${ctx.fieldValue}')`
                    }])

                })

                test('correctly transform operator [$startsWith]', () => {
                    const filter = {
                        [ctx.fieldName]: { $startsWith: ctx.fieldValue }
                    }

                    expect( env.filterParser.parseFilter(filter) ).toEqual([{
                        filterExpr: `REGEX_MATCH({${ctx.fieldName}},'^${ctx.fieldValue}')`
                    }])

                })

                test('correctly transform operator [$endsWith]', () => {
                    const filter = {
                        [ctx.fieldName]: { $endsWith: ctx.fieldValue }
                    }

                    expect( env.filterParser.parseFilter(filter) ).toEqual([{
                        filterExpr: `REGEX_MATCH({${ctx.fieldName}},'${ctx.fieldValue}$')`
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
                const op = o === '$and' ? 'AND' : 'OR'

                expect( env.filterParser.parseFilter(filter) ).toEqual(
                    [{
                    filterExpr: `${op}(${env.filterParser.parseFilter(ctx.filter)[0].filterExpr},${env.filterParser.parseFilter(ctx.anotherFilter)[0].filterExpr})`                
                }]
                )
            })

            test('correctly transform operator [$not]', () => {
                const filter = {
                    $not: [ ctx.filter ]
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: `NOT(${env.filterParser.parseFilter(ctx.filter)[0].filterExpr})`,
                }])
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

        ctx.filter = gen.randomV2Filter()
        ctx.anotherFilter = gen.randomV2Filter()
    })

    beforeAll(function() {
        env.filterParser = new FilterParser
    })


})
