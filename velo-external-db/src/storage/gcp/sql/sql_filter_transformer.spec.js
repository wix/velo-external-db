const { expect } = require('chai')
const { EMPTY_FILTER, EMPTY_SORT, FilterParser } = require('./sql_filter_transformer')
const { Uninitialized } = require('../../../../test/commons/test-commons');
const { randomFilter } = require('../../../../test/drivers/gen');
const chance = new require('chance')();

describe('Sql Parser', () => {
    describe('sort parser', () => {

        // todo: should we even check for valid input or should we let the validation library to handle this ?
        it('handles undefined sort', () => {
            expect( env.filterParser.orderBy('') ).to.be.deep.eql(EMPTY_SORT)
            expect( env.filterParser.orderBy('    ') ).to.be.deep.eql(EMPTY_SORT)
            expect( env.filterParser.orderBy(undefined) ).to.be.deep.eql(EMPTY_SORT)
            expect( env.filterParser.orderBy(null) ).to.be.deep.eql(EMPTY_SORT)
            expect( env.filterParser.orderBy({invalid: 'object'}) ).to.be.deep.eql(EMPTY_SORT)
            expect( env.filterParser.orderBy(555) ).to.be.deep.eql(EMPTY_SORT)
            expect( env.filterParser.orderBy([5555]) ).to.be.deep.eql(EMPTY_SORT)
            expect( env.filterParser.orderBy(['sdfsdf']) ).to.be.deep.eql(EMPTY_SORT)
            expect( env.filterParser.orderBy([null]) ).to.be.deep.eql(EMPTY_SORT)
            expect( env.filterParser.orderBy([undefined]) ).to.be.deep.eql(EMPTY_SORT)
            expect( env.filterParser.orderBy([{invalid: 'object'}]) ).to.be.deep.eql(EMPTY_SORT)
            expect( env.filterParser.orderBy([]) ).to.be.deep.eql(EMPTY_SORT)
        })

        it('process single sort expression invalid sort will return empty result', () => {
            expect( env.filterParser.parseSort({ }) ).to.be.deep.eql([])
            expect( env.filterParser.parseSort({ invalid: 'object' }) ).to.be.deep.eql([])
        })

        it('process single sort expression', () => {
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName, direction: 'asc' }) ).to.be.deep.eql([{ expr: `?? ASC`, params: [ctx.fieldName] }])
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName, direction: 'aSc' }) ).to.be.deep.eql([{ expr: `?? ASC`, params: [ctx.fieldName] }])
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName, direction: 'desc' }) ).to.be.deep.eql([{ expr: `?? DESC`, params: [ctx.fieldName] }])
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName }) ).to.be.deep.eql([{ expr: `?? ASC`, params: [ctx.fieldName] }])
        })

        it('process single sort with valid expression', () => {
            expect( env.filterParser.orderBy([{ fieldName: ctx.fieldName, direction: 'asc' }]) ).to.be.deep.eql({sortExpr: 'ORDER BY ?? ASC', sortColumns: [ctx.fieldName]})
        })

        it('process single sort with two valid expression', () => {
            expect( env.filterParser.orderBy([{ fieldName: ctx.fieldName, direction: 'asc' },
                { fieldName: ctx.anotherFieldName, direction: 'desc' }]) ).to.be.deep.eql({sortExpr: 'ORDER BY ?? ASC, ?? DESC', sortColumns: [ctx.fieldName, ctx.anotherFieldName]})
        })

        it('process single sort with one valid and one invalid expression', () => {
            expect( env.filterParser.orderBy([{ fieldName: ctx.fieldName, direction: 'asc' },
                { invalid: 'object' }]) ).to.be.deep.eql({sortExpr: 'ORDER BY ?? ASC', sortColumns: [ctx.fieldName]})
        })
    })


    describe.only('filter parser', () => {

        it('handles undefined filter', () => {
            expect( env.filterParser.parseFilter('') ).to.be.deep.eql([])
            // expect( env.filterParser.parseFilter('    ') ).to.be.deep.eql(EMPTY_FILTER)
            expect( env.filterParser.parseFilter(undefined) ).to.be.deep.eql([])
            expect( env.filterParser.parseFilter(null) ).to.be.deep.eql([])
            // expect( env.filterParser.parseFilter({invalid: 'object'}) ).to.be.deep.eql(EMPTY_FILTER)
            expect( env.filterParser.parseFilter(555) ).to.be.deep.eql([])
            expect( env.filterParser.parseFilter([5555]) ).to.be.deep.eql([])
            // expect( env.filterParser.parseFilter(['sdfsdf']) ).to.be.deep.eql(EMPTY_FILTER)
            // expect( env.filterParser.parseFilter([null]) ).to.be.deep.eql(EMPTY_FILTER)
            // expect( env.filterParser.parseFilter([undefined]) ).to.be.deep.eql(EMPTY_FILTER)
            // expect( env.filterParser.parseFilter([{invalid: 'object'}]) ).to.be.deep.eql(EMPTY_FILTER)
            // expect( env.filterParser.parseFilter([]) ).to.be.deep.eql(EMPTY_FILTER)
        })

        it('transform filter', () => {
            expect( env.filterParser.transform(ctx.filter) ).to.be.deep.eql({
                filterExpr: `WHERE ${env.filterParser.parseFilter(ctx.filter)[0].filterExpr}`,
                filterColumns: [ctx.filter.fieldName],
                parameters: env.filterParser.parseFilter(ctx.filter)[0].parameters
            })
        })

        describe('handle single field operator', () => {
            ['$ne', '$lt', '$lte', '$gt', '$gte', '$eq', ].forEach(o => {

                it(`correctly transform operator [${o}]`, () => {
                    const filter = {
                        // kind: 'filter',
                        operator: o,
                        fieldName: ctx.fieldName,
                        value: ctx.fieldValue
                    }

                    expect( env.filterParser.parseFilter(filter) ).to.be.deep.eql([{
                        filterExpr: `?? ${env.filterParser.veloOperatorToMySqlOperator(o, ctx.fieldValue)} ?`,
                        filterColumns: [ctx.fieldName],
                        parameters: [ctx.fieldValue]
                    }])

                })
            })

            // todo: $hasAll ???
            it(`correctly transform operator [$hasSome]`, () => {
                const filter = {
                    // kind: 'filter',
                    operator: '$hasSome',
                    fieldName: ctx.fieldName,
                    value: ctx.fieldListValue
                }

                expect( env.filterParser.parseFilter(filter) ).to.be.deep.eql([{
                    filterExpr: `?? IN (?, ?, ?, ?, ?)`,
                    filterColumns: [ctx.fieldName],
                    parameters: ctx.fieldListValue
                }])
            })

            it(`correctly transform operator [$eq] with null value`, () => {
                const filter = {
                    // kind: 'filter',
                    operator: '$eq',
                    fieldName: ctx.fieldName,
                }

                expect( env.filterParser.parseFilter(filter) ).to.be.deep.eql([{
                    filterExpr: `?? IS NULL`,
                    filterColumns: [ctx.fieldName],
                    parameters: []
                }])

            })

            describe('handle string operators', () => {
                //'$contains', '', ''
                it(`correctly transform operator [$contains]`, () => {
                    const filter = {
                        // kind: 'filter',
                        operator: '$contains',
                        fieldName: ctx.fieldName,
                        value: ctx.fieldValue
                    }

                    expect( env.filterParser.parseFilter(filter) ).to.be.deep.eql([{
                        filterExpr: `?? LIKE ?`,
                        filterColumns: [ctx.fieldName],
                        parameters: [`%${ctx.fieldValue}%`]
                    }])

                })

                it(`correctly transform operator [$startsWith]`, () => {
                    const filter = {
                        // kind: 'filter',
                        operator: '$startsWith',
                        fieldName: ctx.fieldName,
                        value: ctx.fieldValue
                    }

                    expect( env.filterParser.parseFilter(filter) ).to.be.deep.eql([{
                        filterExpr: `?? LIKE ?`,
                        filterColumns: [ctx.fieldName],
                        parameters: [`${ctx.fieldValue}%`]
                    }])

                })

                it(`correctly transform operator [$endsWith]`, () => {
                    const filter = {
                        // kind: 'filter',
                        operator: '$endsWith',
                        fieldName: ctx.fieldName,
                        value: ctx.fieldValue
                    }

                    expect( env.filterParser.parseFilter(filter) ).to.be.deep.eql([{
                        filterExpr: `?? LIKE ?`,
                        filterColumns: [ctx.fieldName],
                        parameters: [`%${ctx.fieldValue}`]
                    }])
                })

                it(`correctly transform operator [$urlized]`, () => {
                    const filter = {
                        // kind: 'filter',
                        operator: '$urlized',
                        fieldName: ctx.fieldName,
                        value: ctx.fieldListValue
                    }

                    expect( env.filterParser.parseFilter(filter) ).to.be.deep.eql([{
                        filterExpr: 'LOWER(??) RLIKE ?',
                        filterColumns: [ctx.fieldName],
                        parameters: [ctx.fieldListValue.map(s => s.toLowerCase()).join('[- ]')]
                    }])
                })
            })
        });
        describe('handle multi field operator', () => {
            ['$and', '$or'].forEach(o => {

                it(`correctly transform operator [${o}]`, () => {
                    const filter = {
                        // kind: 'filter',
                        operator: o,
                        value: [ctx.filter, ctx.anotherFilter]
                    }
                    const op = o === '$and' ? 'AND' : 'OR'

                    expect( env.filterParser.parseFilter(filter) ).to.be.deep.eql([{
                        filterExpr: `${env.filterParser.parseFilter(ctx.filter)[0].filterExpr} ${op} ${env.filterParser.parseFilter(ctx.anotherFilter)[0].filterExpr}`,
                        filterColumns: [ctx.filter.fieldName, ctx.anotherFilter.fieldName],
                        parameters: [].concat(env.filterParser.parseFilter(ctx.filter)[0].parameters)
                                      .concat(env.filterParser.parseFilter(ctx.anotherFilter)[0].parameters)
                    }])
                })
            })

            it(`correctly transform operator [$not]`, () => {
                const filter = {
                    // kind: 'filter',
                    operator: '$not',
                    value: ctx.filter
                }

                expect( env.filterParser.parseFilter(filter) ).to.be.deep.eql([{
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

    before(function() {
        env.filterParser = new FilterParser
    });


})
