const FilterParser = require('./sql_filter_transformer')
const { EMPTY_SORT } = require('velo-external-db-commons')
const { escapeIdentifier } = require('./postgres_utils')
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
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName, direction: 'asc' }) ).toEqual([{ expr: `${escapeIdentifier(ctx.fieldName)} ASC` }])
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName, direction: 'aSc' }) ).toEqual([{ expr: `${escapeIdentifier(ctx.fieldName)} ASC` }])
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName, direction: 'desc' }) ).toEqual([{ expr: `${escapeIdentifier(ctx.fieldName)} DESC` }])
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName }) ).toEqual([{ expr: `${escapeIdentifier(ctx.fieldName)} ASC` }])
        })

        test('process single sort with valid expression', () => {
            expect( env.filterParser.orderBy([{ fieldName: ctx.fieldName, direction: 'asc' }]) ).toEqual({ sortExpr: `ORDER BY ${escapeIdentifier(ctx.fieldName)} ASC` })
        })

        test('process single sort with two valid expression', () => {
            expect( env.filterParser.orderBy([{ fieldName: ctx.fieldName, direction: 'asc' },
                { fieldName: ctx.anotherFieldName, direction: 'desc' }]) ).toEqual({ sortExpr: `ORDER BY ${escapeIdentifier(ctx.fieldName)} ASC, ${escapeIdentifier(ctx.anotherFieldName)} DESC` })
        })

        test('process single sort with one valid and one invalid expression', () => {
            expect( env.filterParser.orderBy([{ fieldName: ctx.fieldName, direction: 'asc' },
                { invalid: 'object' }]) ).toEqual({ sortExpr: `ORDER BY ${escapeIdentifier(ctx.fieldName)} ASC` })
        })
    })


    describe('filter parser', () => {

        test('handles undefined filter', () => {
            expect( env.filterParser.parseFilter('', ctx.offset) ).toEqual([])
            expect( env.filterParser.parseFilter(undefined, ctx.offset) ).toEqual([])
            expect( env.filterParser.parseFilter(null, ctx.offset) ).toEqual([])
            expect( env.filterParser.parseFilter(555, ctx.offset) ).toEqual([])
            expect( env.filterParser.parseFilter([5555], ctx.offset) ).toEqual([])
        })

        test('transform filter', () => {
            expect( env.filterParser.transform(ctx.filter) ).toEqual({
                filterExpr: `WHERE ${env.filterParser.parseFilter(ctx.filter, 1)[0].filterExpr}`,
                filterColumns: [],
                offset: env.filterParser.parseFilter(ctx.filter, 1)[0].offset,
                parameters: env.filterParser.parseFilter(ctx.filter, 1)[0].parameters
            })
        })

        describe('handle single field operator', () => {
            each([
                '$ne', '$lt', '$lte', '$gt', '$gte', '$eq',
            ]).test('correctly transform operator [%s]', (o) => {
                const filter = {
                    [ctx.fieldName]: { [o]: ctx.fieldValue }
                }

                expect( env.filterParser.parseFilter(filter, ctx.offset) ).toEqual([{
                    filterExpr: `${escapeIdentifier(ctx.fieldName)} ${env.filterParser.veloOperatorToMySqlOperator(o, ctx.fieldValue)} $${ctx.offset}`,
                    filterColumns: [],
                    offset: ctx.offset + 1,
                    parameters: [ctx.fieldValue]
                }])

            })

            test('correctly extract filter value if value is 0', () => {
                const filter = {
                    [ctx.fieldName]: { '$eq': 0 }
                }

                expect( env.filterParser.parseFilter(filter, ctx.offset) ).toEqual([{
                    filterExpr: `${escapeIdentifier(ctx.fieldName)} = $${ctx.offset}`,
                    filterColumns: [],
                    offset: ctx.offset + 1,
                    parameters: [0]
                }])

            })

            // todo: $hasAll ???
            test('correctly transform operator [$hasSome]', () => {
                const filter = {
                    [ctx.fieldName]: { '$hasSome': ctx.fieldListValue }
                }

                expect( env.filterParser.parseFilter(filter, ctx.offset) ).toEqual([{
                    filterExpr: `${escapeIdentifier(ctx.fieldName)} IN ($${ctx.offset}, $${ctx.offset + 1}, $${ctx.offset + 2}, $${ctx.offset + 3}, $${ctx.offset + 4})`,
                    offset: ctx.offset + ctx.fieldListValue.length,
                    filterColumns: [],
                    parameters: ctx.fieldListValue
                }])
            })

            test('operator [$hasSome] with empty list of values will throw an exception', () => {
                const filter = {
                    [ctx.fieldName]: { '$hasSome': [] }
                }

                expect( () => env.filterParser.parseFilter(filter, ctx.offset) ).toThrow(InvalidQuery)
            })

            test('correctly transform operator [$eq] with null value', () => {
                const filter = {
                    [ctx.fieldName]: { '$eq': undefined } 
                }

                expect( env.filterParser.parseFilter(filter, ctx.offset) ).toEqual([{
                    filterExpr: `${escapeIdentifier(ctx.fieldName)} IS NULL`,
                    filterColumns: [],
                    offset: ctx.offset,
                    parameters: []
                }])
            })

            test('correctly transform operator [$eq] with boolean value', () => {
                const value = chance.bool()
                const filter = {
                    [ctx.fieldName]: { '$eq': value } 
                }

                expect( env.filterParser.parseFilter(filter, ctx.offset) ).toEqual([{
                    filterExpr: `${escapeIdentifier(ctx.fieldName)} = $${ctx.offset}`,
                    filterColumns: [],
                    offset: ctx.offset + 1,
                    parameters: [value ? 1 : 0]
                }])
            })

            describe('handle string operators', () => {
                test('correctly transform operator [$contains]', () => {
                    const filter = {
                        [ctx.fieldName]: { '$contains': ctx.fieldValue }
                    }

                    expect( env.filterParser.parseFilter(filter, ctx.offset) ).toEqual([{
                        filterExpr: `${escapeIdentifier(ctx.fieldName)} LIKE $${ctx.offset}`,
                        filterColumns: [],
                        offset: ctx.offset + 1,
                        parameters: [`%${ctx.fieldValue}%`]
                    }])
                })

                test('correctly transform operator [$startsWith]', () => {
                    const filter = {
                        [ctx.fieldName]: { '$startsWith': ctx.fieldValue }
                    }

                    expect( env.filterParser.parseFilter(filter, ctx.offset) ).toEqual([{
                        filterExpr: `${escapeIdentifier(ctx.fieldName)} LIKE $${ctx.offset}`,
                        filterColumns: [],
                        offset: ctx.offset + 1,
                        parameters: [`${ctx.fieldValue}%`]
                    }])
                })

                test('correctly transform operator [$endsWith]', () => {
                    const filter = {
                        [ctx.fieldName]: { '$endsWith': ctx.fieldValue }
                    }

                    expect( env.filterParser.parseFilter(filter, ctx.offset) ).toEqual([{
                        filterExpr: `${escapeIdentifier(ctx.fieldName)} LIKE $${ctx.offset}`,
                        filterColumns: [],
                        offset: ctx.offset + 1,
                        parameters: [`%${ctx.fieldValue}`]
                    }])
                })

                test('correctly transform operator [$urlized]', () => {
                    const filter = {
                        [ctx.fieldName]: { '$urlized': ctx.fieldListValue } 
                    }

                    expect( env.filterParser.parseFilter(filter, ctx.offset) ).toEqual([{
                        filterExpr: `LOWER(${escapeIdentifier(ctx.fieldName)}) RLIKE $${ctx.offset}`,
                        filterColumns: [],
                        offset: ctx.offset + 1,
                        parameters: [ctx.fieldListValue.map(s => s.toLowerCase()).join('[- ]')]
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

                const filter1 = env.filterParser.parseFilter(ctx.filter, ctx.offset)[0]
                const filter2 = env.filterParser.parseFilter(ctx.anotherFilter, filter1.offset)[0]
                expect( env.filterParser.parseFilter(filter, ctx.offset) ).toEqual([{
                    filterExpr: `${filter1.filterExpr} ${op} ${filter2.filterExpr}`,
                    filterColumns: [],
                    offset: filter2.offset,
                    parameters: [].concat(filter1.parameters)
                                  .concat(filter2.parameters)
                }])
            })

            test('correctly transform operator [$not]', () => {
                const filter = {
                    '$not' : [ ctx.filter ]
                }

                expect( env.filterParser.parseFilter(filter, ctx.offset) ).toEqual([{
                    filterExpr: `NOT (${env.filterParser.parseFilter(ctx.filter, ctx.offset)[0].filterExpr})`,
                    filterColumns: [],
                    offset: env.filterParser.parseFilter(ctx.filter, ctx.offset)[0].offset,
                    parameters: env.filterParser.parseFilter(ctx.filter, ctx.offset)[0].parameters
                }])
            })
        })


        describe('aggregation functions', () => {

            describe('transform select fields', () => {
                test('single id field', () => {
                    const aggregation = {
                        _id: `$${ctx.fieldName}`
                    }

                    expect( env.filterParser.parseAggregation(aggregation) ).toEqual({
                        fieldsStatement: escapeIdentifier(ctx.fieldName),
                        groupByColumns: [ctx.fieldName],
                        havingFilter: '',
                        parameters: []
                    })
                })

                test('multiple id fields', () => {
                    const aggregation = {
                        _id: {
                            field1: `$${ctx.fieldName}`,
                            field2: `$${ctx.anotherFieldName}`
                        }
                    }

                    expect( env.filterParser.parseAggregation(aggregation) ).toEqual({
                        fieldsStatement: `${escapeIdentifier(ctx.fieldName)}, ${escapeIdentifier(ctx.anotherFieldName)}`,
                        groupByColumns: [ctx.fieldName, ctx.anotherFieldName],
                        havingFilter: '',
                        parameters: [],
                    })
                })

                test('process having filter', () => {
                    const aggregation = {
                        _id: `$${ctx.fieldName}`,
                        [ctx.moreFieldName]: {
                            $avg: `$${ctx.anotherFieldName}`
                        }
                    }

                    const havingFilter = { [ctx.moreFieldName]: { $gt: ctx.fieldValue } }

                    expect( env.filterParser.parseAggregation(aggregation, havingFilter, ctx.offset) ).toEqual({
                        fieldsStatement: `${escapeIdentifier(ctx.fieldName)}, AVG(${escapeIdentifier(ctx.anotherFieldName)}) AS ${escapeIdentifier(ctx.moreFieldName)}`,
                        groupByColumns: [ctx.fieldName],
                        havingFilter: `HAVING AVG(${escapeIdentifier(ctx.anotherFieldName)}) > $${ctx.offset}`,
                        parameters: [ctx.fieldValue],
                    })
                })

                each([
                    ['AVG', '$avg'],
                    ['MIN', '$min'],
                    ['MAX', '$max'],
                    ['SUM', '$sum'],
                ]).test('translate %s function', (mySqlFunction, wixDataFunction) => {
                    const aggregation = {
                        _id: `$${ctx.fieldName}`,
                        [ctx.moreFieldName]: {
                            [wixDataFunction]: `$${ctx.anotherFieldName}`
                        }
                    }

                    expect( env.filterParser.parseAggregation(aggregation) ).toEqual({
                        fieldsStatement: `${escapeIdentifier(ctx.fieldName)}, ${mySqlFunction}(${escapeIdentifier(ctx.anotherFieldName)}) AS ${escapeIdentifier(ctx.moreFieldName)}`,
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

        ctx.filter = gen.randomV2Filter()
        ctx.anotherFilter = gen.randomV2Filter()

        ctx.offset = chance.natural({ min: 2, max: 20 })
    })

    beforeAll(function() {
        env.filterParser = new FilterParser
    })


})
