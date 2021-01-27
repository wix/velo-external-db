const { expect } = require('chai')
const { EMPTY_SORT, FilterParser } = require('./sql_filter_transformer')
const { Uninitialized } = require('../../../../test/commons/test-commons');
const chance = new require('chance')();

describe('Sql Parser', () => {
    describe('sort parser', () => {

        // todo: should we even check for valid input or should we let the validation library to handle this ?
        it('handles undefined sort', async () => {
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

        it('process single sort expression invalid sort will return empty result', async () => {
            expect( env.filterParser.parseSort({ }) ).to.be.deep.eql([])
            expect( env.filterParser.parseSort({ invalid: 'object' }) ).to.be.deep.eql([])
        })

        it('process single sort expression', async () => {
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName, direction: 'asc' }) ).to.be.deep.eql([{ expr: `?? ASC`, params: [ctx.fieldName] }])
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName, direction: 'aSc' }) ).to.be.deep.eql([{ expr: `?? ASC`, params: [ctx.fieldName] }])
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName, direction: 'desc' }) ).to.be.deep.eql([{ expr: `?? DESC`, params: [ctx.fieldName] }])
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName }) ).to.be.deep.eql([{ expr: `?? ASC`, params: [ctx.fieldName] }])
        })

        it('process single sort with valid expression', async () => {
            expect( env.filterParser.orderBy([{ fieldName: ctx.fieldName, direction: 'asc' }]) ).to.be.deep.eql({sortExpr: 'ORDER BY ?? ASC', sortColumns: [ctx.fieldName]})
        })

        it('process single sort with two valid expression', async () => {
            expect( env.filterParser.orderBy([{ fieldName: ctx.fieldName, direction: 'asc' },
                { fieldName: ctx.anotherFieldName, direction: 'desc' }]) ).to.be.deep.eql({sortExpr: 'ORDER BY ?? ASC, ?? DESC', sortColumns: [ctx.fieldName, ctx.anotherFieldName]})
        })

        it('process single sort with one valid and one invalid expression', async () => {
            expect( env.filterParser.orderBy([{ fieldName: ctx.fieldName, direction: 'asc' },
                { invalid: 'object' }]) ).to.be.deep.eql({sortExpr: 'ORDER BY ?? ASC', sortColumns: [ctx.fieldName]})
        })
    })

    const ctx = {
        fieldName: Uninitialized,
        anotherFieldName: Uninitialized,
    };

    const env = {
        filterParser: Uninitialized,
    };

    beforeEach(() => {
        ctx.fieldName = chance.word();
        ctx.anotherFieldName = chance.word();
    });

    before(async function() {
        env.filterParser = new FilterParser
    });
})
