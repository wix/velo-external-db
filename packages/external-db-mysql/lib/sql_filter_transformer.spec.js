const { EMPTY_SORT, FilterParser } = require('./sql_filter_transformer')
const { Uninitialized, gen } = require('test-commons')
const { InvalidQuery } = require('velo-external-db-commons').errors
const each = require('jest-each').default
const Chance = require('chance')
const { escapeId } = require('mysql')
const chance = Chance();

describe('Sql Parser', () => {
    describe('sort parser', () => {

        // todo: should we even check for valid input or should we let the validation library to handle this ?
        test('handles undefined sort', () => {
            expect( env.filterParser.orderBy('') ).toEqual(EMPTY_SORT)
            expect( env.filterParser.orderBy('    ') ).toEqual(EMPTY_SORT)
            expect( env.filterParser.orderBy(undefined) ).toEqual(EMPTY_SORT)
            expect( env.filterParser.orderBy(null) ).toEqual(EMPTY_SORT)
            expect( env.filterParser.orderBy({invalid: 'object'}) ).toEqual(EMPTY_SORT)
            expect( env.filterParser.orderBy(555) ).toEqual(EMPTY_SORT)
            expect( env.filterParser.orderBy([5555]) ).toEqual(EMPTY_SORT)
            expect( env.filterParser.orderBy(['sdfsdf']) ).toEqual(EMPTY_SORT)
            expect( env.filterParser.orderBy([null]) ).toEqual(EMPTY_SORT)
            expect( env.filterParser.orderBy([undefined]) ).toEqual(EMPTY_SORT)
            expect( env.filterParser.orderBy([{invalid: 'object'}]) ).toEqual(EMPTY_SORT)
            expect( env.filterParser.orderBy([]) ).toEqual(EMPTY_SORT)
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
            expect( env.filterParser.orderBy([{ fieldName: ctx.fieldName, direction: 'asc' }]) ).toEqual({sortExpr: `ORDER BY ${escapeId(ctx.fieldName)} ASC`})
        })

        test('process single sort with two valid expression', () => {
            expect( env.filterParser
                       .orderBy([{ fieldName: ctx.fieldName, direction: 'asc' },
                                 { fieldName: ctx.anotherFieldName, direction: 'desc' }]) ).toEqual({ sortExpr: `ORDER BY ${escapeId(ctx.fieldName)} ASC, ${escapeId(ctx.anotherFieldName)} DESC`})
        })

        test('process single sort with one valid and one invalid expression', () => {
            expect( env.filterParser.orderBy([{ fieldName: ctx.fieldName, direction: 'asc' },
                { invalid: 'object' }]) ).toEqual({ sortExpr: `ORDER BY ${escapeId(ctx.fieldName)} ASC` })
        })
    })


    describe('filter parser', () => {

        test('handles undefined filter', () => {
            expect( env.filterParser.parseFilter('') ).toEqual([])
            // expect( env.filterParser.parseFilter('    ') ).toEqual(EMPTY_FILTER)
            expect( env.filterParser.parseFilter(undefined) ).toEqual([])
            expect( env.filterParser.parseFilter(null) ).toEqual([])
            // expect( env.filterParser.parseFilter({invalid: 'object'}) ).toEqual(EMPTY_FILTER)
            expect( env.filterParser.parseFilter(555) ).toEqual([])
            expect( env.filterParser.parseFilter([5555]) ).toEqual([])
            // expect( env.filterParser.parseFilter(['sdfsdf']) ).toEqual(EMPTY_FILTER)
            // expect( env.filterParser.parseFilter([null]) ).toEqual(EMPTY_FILTER)
            // expect( env.filterParser.parseFilter([undefined]) ).toEqual(EMPTY_FILTER)
            // expect( env.filterParser.parseFilter([{invalid: 'object'}]) ).toEqual(EMPTY_FILTER)
            // expect( env.filterParser.parseFilter([]) ).toEqual(EMPTY_FILTER)
        })

        test('transform filter', () => {
            expect( env.filterParser.transform(ctx.filter) ).toEqual({
                filterExpr: `WHERE ${env.filterParser.parseFilter(ctx.filter)[0].filterExpr}`,
                parameters: env.filterParser.parseFilter(ctx.filter)[0].parameters
            })
        })

        describe('handle single field operator', () => {
            each([
                '$ne', '$lt', '$lte', '$gt', '$gte', '$eq',
            ]).test(`correctly transform operator [%s]`, (o) => {
                const filter = {
                    // kind: 'filter',
                    operator: o,
                    fieldName: ctx.fieldName,
                    value: ctx.fieldValue
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: `${escapeId(ctx.fieldName)} ${env.filterParser.veloOperatorToMySqlOperator(o, ctx.fieldValue)} ?`,
                    parameters: [ctx.fieldValue]
                }])

            })

            test(`correctly extract filter value if value is 0`, () => {
                const filter = {
                    operator: '$eq',
                    fieldName: ctx.fieldName,
                    value: 0
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: `${escapeId(ctx.fieldName)} = ?`,
                    parameters: [0]
                }])

            })

            // todo: $hasAll ???
            test(`correctly transform operator [$hasSome]`, () => {
                const filter = {
                    // kind: 'filter',
                    operator: '$hasSome',
                    fieldName: ctx.fieldName,
                    value: ctx.fieldListValue
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: `${escapeId(ctx.fieldName)} IN (?, ?, ?, ?, ?)`,
                    parameters: ctx.fieldListValue
                }])
            })

            test(`operator [$hasSome] with empty list of values will throw an exception`, () => {
                const filter = {
                    // kind: 'filter',
                    operator: '$hasSome',
                    fieldName: ctx.fieldName,
                    value: []
                }

                expect( () => env.filterParser.parseFilter(filter) ).toThrow(InvalidQuery)
            })

            test(`correctly transform operator [$eq] with null value`, () => {
                const filter = {
                    // kind: 'filter',
                    operator: '$eq',
                    fieldName: ctx.fieldName,
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: `${escapeId(ctx.fieldName)} IS NULL`,
                    parameters: []
                }])

            })

            test(`correctly transform operator [$eq] with boolean value`, () => {
                const filter = {
                    operator: '$eq',
                    fieldName: ctx.fieldName,
                    value: chance.bool()
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: `${escapeId(ctx.fieldName)} = ?`,
                    parameters: [filter.value ? 1 : 0]
                }])

            })

            describe('handle string operators', () => {
                //'$contains', '', ''
                test(`correctly transform operator [$contains]`, () => {
                    const filter = {
                        // kind: 'filter',
                        operator: '$contains',
                        fieldName: ctx.fieldName,
                        value: ctx.fieldValue
                    }

                    expect( env.filterParser.parseFilter(filter) ).toEqual([{
                        filterExpr: `${escapeId(ctx.fieldName)} LIKE ?`,
                        parameters: [`%${ctx.fieldValue}%`]
                    }])

                })

                test(`correctly transform operator [$startsWith]`, () => {
                    const filter = {
                        // kind: 'filter',
                        operator: '$startsWith',
                        fieldName: ctx.fieldName,
                        value: ctx.fieldValue
                    }

                    expect( env.filterParser.parseFilter(filter) ).toEqual([{
                        filterExpr: `${escapeId(ctx.fieldName)} LIKE ?`,
                        parameters: [`${ctx.fieldValue}%`]
                    }])

                })

                test(`correctly transform operator [$endsWith]`, () => {
                    const filter = {
                        // kind: 'filter',
                        operator: '$endsWith',
                        fieldName: ctx.fieldName,
                        value: ctx.fieldValue
                    }

                    expect( env.filterParser.parseFilter(filter) ).toEqual([{
                        filterExpr: `${escapeId(ctx.fieldName)} LIKE ?`,
                        parameters: [`%${ctx.fieldValue}`]
                    }])
                })

                test(`correctly transform operator [$urlized]`, () => {
                    const filter = {
                        // kind: 'filter',
                        operator: '$urlized',
                        fieldName: ctx.fieldName,
                        value: ctx.fieldListValue
                    }

                    expect( env.filterParser.parseFilter(filter) ).toEqual([{
                        filterExpr: `LOWER(${escapeId(ctx.fieldName)}) RLIKE ?`,
                        parameters: [ctx.fieldListValue.map(s => s.toLowerCase()).join('[- ]')]
                    }])
                })
            })
        });
        describe('handle multi field operator', () => {
            each([
                '$and', '$or'
            ]).test(`correctly transform operator [%s]`, (o) => {
                const filter = {
                    // kind: 'filter',
                    operator: o,
                    value: [ctx.filter, ctx.anotherFilter]
                }
                const op = o === '$and' ? 'AND' : 'OR'

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: `${env.filterParser.parseFilter(ctx.filter)[0].filterExpr} ${op} ${env.filterParser.parseFilter(ctx.anotherFilter)[0].filterExpr}`,
                    parameters: [].concat(env.filterParser.parseFilter(ctx.filter)[0].parameters)
                                  .concat(env.filterParser.parseFilter(ctx.anotherFilter)[0].parameters)
                }])
            })

            test(`correctly transform operator [$not]`, () => {
                const filter = {
                    // kind: 'filter',
                    operator: '$not',
                    value: ctx.filter
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: `NOT (${env.filterParser.parseFilter(ctx.filter)[0].filterExpr})`,
                    parameters: env.filterParser.parseFilter(ctx.filter)[0].parameters
                }])
            })
        });


        describe('aggregation functions', () => {

            describe('transform select fields', () => {
                test(`single id field`, () => {
                    const aggregation = {
                        _id: ctx.fieldName
                    }

                    expect( env.filterParser.parseAggregation(aggregation) ).toEqual({
                        fieldsStatement: escapeId(ctx.fieldName),
                        groupByColumns: [ctx.fieldName],
                        havingFilter: '',
                        parameters: [],
                    })
                })

                test(`multiple id fields`, () => {
                    const aggregation = {
                        _id: {
                            field1: ctx.fieldName,
                            field2: ctx.anotherFieldName
                        }
                    }

                    expect( env.filterParser.parseAggregation(aggregation) ).toEqual({
                        fieldsStatement: `${escapeId(ctx.fieldName)}, ${escapeId(ctx.anotherFieldName)}`,
                        groupByColumns: [ctx.fieldName, ctx.anotherFieldName],
                        havingFilter: '',
                        parameters: [],
                    })
                })

                test(`process having filter`, () => {
                    const aggregation = {
                        _id: ctx.fieldName,
                        [ctx.moreFieldName]: {
                            '$avg': ctx.anotherFieldName
                        }
                    }

                    const havingFilter = { operator: '$gt', fieldName: ctx.moreFieldName, value: ctx.fieldValue}

                    expect( env.filterParser.parseAggregation(aggregation, havingFilter) ).toEqual({
                        fieldsStatement: `${escapeId(ctx.fieldName)}, AVG(${escapeId(ctx.anotherFieldName)}) AS ${escapeId(ctx.moreFieldName)}`,
                        groupByColumns: [ctx.fieldName],
                        havingFilter: `HAVING ${escapeId(ctx.moreFieldName)} > ?`,
                        parameters: [ctx.fieldValue],
                    })
                })


                each([
                    ['AVG', '$avg'],
                    ['MIN', '$min'],
                    ['MAX', '$max'],
                    ['SUM', '$sum'],
                ]).test(`translate %s function`, (mySqlFunction, wixDataFunction) => {
                    const aggregation = {
                        _id: ctx.fieldName,
                        [ctx.moreFieldName]: {
                            [wixDataFunction]: ctx.anotherFieldName
                        }
                    }

                    expect( env.filterParser.parseAggregation(aggregation) ).toEqual({
                        fieldsStatement: `${escapeId(ctx.fieldName)}, ${mySqlFunction}(${escapeId(ctx.anotherFieldName)}) AS ${escapeId(ctx.moreFieldName)}`,
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
    };

    const env = {
        filterParser: Uninitialized,
    };

    beforeEach(() => {
        ctx.fieldName = chance.word();
        ctx.anotherFieldName = chance.word();
        ctx.moreFieldName = chance.word();

        ctx.fieldValue = chance.word();
        ctx.fieldListValue = [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()];

        ctx.filter = gen.randomFilter();
        ctx.anotherFilter = gen.randomFilter();
    });

    beforeAll(function() {
        env.filterParser = new FilterParser
    });


})
