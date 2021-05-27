const { EMPTY_FILTER, EMPTY_SORT, FilterParser } = require('./sql_filter_transformer')
const { Uninitialized } = require('../../../../test/commons/test-commons');
const { randomFilter } = require('../../../../test/drivers/gen');
const Chance = require('chance')
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
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName, direction: 'asc' }) ).toEqual([{ expr: `?? ASC`, params: [ctx.fieldName] }])
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName, direction: 'aSc' }) ).toEqual([{ expr: `?? ASC`, params: [ctx.fieldName] }])
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName, direction: 'desc' }) ).toEqual([{ expr: `?? DESC`, params: [ctx.fieldName] }])
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName }) ).toEqual([{ expr: `?? ASC`, params: [ctx.fieldName] }])
        })

        test('process single sort with valid expression', () => {
            expect( env.filterParser.orderBy([{ fieldName: ctx.fieldName, direction: 'asc' }]) ).toEqual({sortExpr: 'ORDER BY ?? ASC', sortColumns: [ctx.fieldName]})
        })

        test('process single sort with two valid expression', () => {
            expect( env.filterParser.orderBy([{ fieldName: ctx.fieldName, direction: 'asc' },
                { fieldName: ctx.anotherFieldName, direction: 'desc' }]) ).toEqual({sortExpr: 'ORDER BY ?? ASC, ?? DESC', sortColumns: [ctx.fieldName, ctx.anotherFieldName]})
        })

        test('process single sort with one valid and one invalid expression', () => {
            expect( env.filterParser.orderBy([{ fieldName: ctx.fieldName, direction: 'asc' },
                { invalid: 'object' }]) ).toEqual({sortExpr: 'ORDER BY ?? ASC', sortColumns: [ctx.fieldName]})
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
                filterColumns: [ctx.filter.fieldName],
                parameters: env.filterParser.parseFilter(ctx.filter)[0].parameters
            })
        })

        describe('handle single field operator', () => {
            ['$ne', '$lt', '$lte', '$gt', '$gte', '$eq', ].forEach(o => {

                test(`correctly transform operator [${o}]`, () => {
                    const filter = {
                        // kind: 'filter',
                        operator: o,
                        fieldName: ctx.fieldName,
                        value: ctx.fieldValue
                    }

                    expect( env.filterParser.parseFilter(filter) ).toEqual([{
                        filterExpr: `?? ${env.filterParser.veloOperatorToMySqlOperator(o, ctx.fieldValue)} ?`,
                        filterColumns: [ctx.fieldName],
                        parameters: [ctx.fieldValue]
                    }])

                })
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
                    filterExpr: `?? IN (?, ?, ?, ?, ?)`,
                    filterColumns: [ctx.fieldName],
                    parameters: ctx.fieldListValue
                }])
            })

            test(`correctly transform operator [$eq] with null value`, () => {
                const filter = {
                    // kind: 'filter',
                    operator: '$eq',
                    fieldName: ctx.fieldName,
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: `?? IS NULL`,
                    filterColumns: [ctx.fieldName],
                    parameters: []
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
                        filterExpr: `?? LIKE ?`,
                        filterColumns: [ctx.fieldName],
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
                        filterExpr: `?? LIKE ?`,
                        filterColumns: [ctx.fieldName],
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
                        filterExpr: `?? LIKE ?`,
                        filterColumns: [ctx.fieldName],
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
                        filterExpr: 'LOWER(??) RLIKE ?',
                        filterColumns: [ctx.fieldName],
                        parameters: [ctx.fieldListValue.map(s => s.toLowerCase()).join('[- ]')]
                    }])
                })
            })
        });
        describe('handle multi field operator', () => {
            ['$and', '$or'].forEach(o => {

                test(`correctly transform operator [${o}]`, () => {
                    const filter = {
                        // kind: 'filter',
                        operator: o,
                        value: [ctx.filter, ctx.anotherFilter]
                    }
                    const op = o === '$and' ? 'AND' : 'OR'

                    expect( env.filterParser.parseFilter(filter) ).toEqual([{
                        filterExpr: `${env.filterParser.parseFilter(ctx.filter)[0].filterExpr} ${op} ${env.filterParser.parseFilter(ctx.anotherFilter)[0].filterExpr}`,
                        filterColumns: [ctx.filter.fieldName, ctx.anotherFilter.fieldName],
                        parameters: [].concat(env.filterParser.parseFilter(ctx.filter)[0].parameters)
                                      .concat(env.filterParser.parseFilter(ctx.anotherFilter)[0].parameters)
                    }])
                })
            })

            test(`correctly transform operator [$not]`, () => {
                const filter = {
                    // kind: 'filter',
                    operator: '$not',
                    value: ctx.filter
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    filterExpr: `NOT (${env.filterParser.parseFilter(ctx.filter)[0].filterExpr})`,
                    filterColumns: [ctx.filter.fieldName],
                    parameters: env.filterParser.parseFilter(ctx.filter)[0].parameters
                }])
            })
        });

    })

    const ctx = {
        fieldName: Uninitialized,
        fieldValue: Uninitialized,
        fieldListValue: Uninitialized,
        anotherFieldName: Uninitialized,
        filter: Uninitialized,
        anotherFilter: Uninitialized,
    };

    const env = {
        filterParser: Uninitialized,
    };

    beforeEach(() => {
        ctx.fieldName = chance.word();
        ctx.anotherFieldName = chance.word();

        ctx.fieldValue = chance.word();
        ctx.fieldListValue = [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()];

        ctx.filter = randomFilter();
        ctx.anotherFilter = randomFilter();
    });

    beforeAll(function() {
        env.filterParser = new FilterParser
    });


})
