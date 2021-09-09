const FilterParser = require('./sql_filter_transformer')
// const { escapeId, testLiteral, validateLiteral } = require('./spanner_utils')
const { Uninitialized, gen } = require('test-commons')
const { InvalidQuery } = require('velo-external-db-commons').errors
const each = require('jest-each').default
const Chance = require('chance')
const chance = Chance();

const EMPTY_SORT = []

const randomFilter = () => {
    const op = chance.pickone(['$ne', '$lt', '$lte', '$gt', '$gte', '$hasSome', '$eq', '$startsWith', '$endsWith'])
    return {
        operator: op,
        fieldName: chance.word(),
        value: op === '$hasSome' ? [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()] : chance.word()
    }
}

describe('Fire Store Parser', () => {

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
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName, direction: 'asc' }) ).toEqual([{ fieldName: ctx.fieldName, direction:'asc' }])
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName, direction: 'aSc' }) ).toEqual([{ fieldName: ctx.fieldName, direction:'asc' }])
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName, direction: 'desc' }) ).toEqual([{ fieldName: ctx.fieldName, direction:'desc' }])
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName }) ).toEqual([{ fieldName: ctx.fieldName, direction:'asc' }])
        })

        test('process single sort with valid expression', () => {
            expect( env.filterParser.orderBy([{ fieldName: ctx.fieldName, direction: 'asc' }]) ).toEqual([{ fieldName: ctx.fieldName, direction:'asc' }])
        })

        test('process single sort with two valid expression', () => {
            expect( env.filterParser.orderBy([{ fieldName: ctx.fieldName, direction: 'asc' },
                { fieldName: ctx.anotherFieldName, direction: 'desc' }]) ).toEqual([{ fieldName: ctx.fieldName, direction:'asc' },{ fieldName: ctx.anotherFieldName, direction:'desc' }])
        })

        test('process single sort with one valid and one invalid expression', () => {
            expect( env.filterParser.orderBy([{ fieldName: ctx.fieldName, direction: 'asc' },
                { invalid: 'object' }]) ).toEqual([{ fieldName: ctx.fieldName, direction:'asc' }])
        })
    })
//
//
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
            expect( env.filterParser.transform(ctx.filter) ).toEqual([{
                fieldName: ctx.filter.fieldName,
                opStr: env.filterParser.veloOperatorToFirestoreOperator(ctx.filter.operator,ctx.filter.value),
                value: env.filterParser.valueForOperator(ctx.filter.value,ctx.filter.operator)
            }])
        })
        
        })

        describe('handle single field operator', () => {
            each([
                '$ne', '$lt', '$lte', '$gt', '$gte', '$eq',
            ]).test(`correctly transform operator [%s]`, (o) => {
                const filter = {
                    operator: o,
                    fieldName: ctx.fieldName,
                    value: ctx.fieldValue
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    fieldName: ctx.fieldName,
                    opStr: env.filterParser.veloOperatorToFirestoreOperator(o, ctx.fieldValue),
                    value: ctx.fieldValue,
                }])

            })

            test(`correctly extract filter value if value is 0`, () => {
                const filter = {
                    operator: '$eq',
                    fieldName: ctx.fieldName,
                    value: 0
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    fieldName: ctx.fieldName,
                    opStr: env.filterParser.veloOperatorToFirestoreOperator('$eq', ctx.fieldValue),
                    value: 0,
                }])

            })

        //     // todo: $hasAll ???
            test(`correctly transform operator [$hasSome]`, () => {
                const filter = {
                    operator: '$hasSome',
                    fieldName: ctx.fieldName,
                    value: ctx.fieldListValue
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([
                {
                    fieldName: ctx.fieldName,
                    opStr: env.filterParser.veloOperatorToFirestoreOperator('$hasSome'),
                    value: ctx.fieldListValue,
                }
            
            ])
            })

            test(`operator [$hasSome] with empty list of values will throw an exception`, () => {
                const filter = {
                    operator: '$hasSome',
                    fieldName: ctx.fieldName,
                    value: []
                }

                expect( () => env.filterParser.parseFilter(filter) ).toThrow(InvalidQuery)
            })

            test(`correctly transform operator [$eq] with null value`, () => {
                const filter = {
                    operator: '$eq',
                    fieldName: ctx.fieldName,
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    fieldName: ctx.fieldName,
                    opStr: env.filterParser.veloOperatorToFirestoreOperator('$eq'),
                    value: null
                }])
            })

            test(`correctly transform operator [$eq] with boolean value`, () => {
                const filter = {
                    operator: '$eq',
                    fieldName: ctx.fieldName,
                    value: chance.bool()
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    fieldName: ctx.fieldName,
                    opStr: env.filterParser.veloOperatorToFirestoreOperator('$eq'),               
                    value: filter.value 
                }])
            })

            describe('handle string operators', () => {
                each([
                    '$contains', '$urlized',
                ]).test(`operator [$contains] will throw an exception`, () => {
                    const filter = {
                        operator: '$contains',
                        fieldName: ctx.fieldName,
                        value: ctx.fieldValue
                    }

                    expect(() => env.filterParser.parseFilter(filter)).toThrow(InvalidQuery)
                })

                each([
                    '$startsWith', '$endsWith',
                ]).test(`correctly transform operator [%s]`, (o) => {
                    const filter = {
                        operator: o,
                        fieldName: ctx.fieldName,
                        value: ctx.fieldValue
                    }

                    expect( env.filterParser.parseFilter(filter) ).toEqual([{
                        fieldName: ctx.fieldName,
                        opStr: env.filterParser.veloOperatorToFirestoreOperator(o, ctx.fieldValue),
                        value: ctx.fieldValue,
                    }])

                })

                test(`correctly transform operator [$urlized]`, () => {
                    const filter = {
                        operator: '$urlized',
                        fieldName: ctx.fieldName,
                        value: ctx.fieldListValue
                    }

                    expect(() => env.filterParser.parseFilter(filter)).toThrow(InvalidQuery)

                })
            
        });

        describe('handle multi field operator', () => {
            each([
                '$and'
            ]).test(`correctly transform operator [%s]`, (o) => {
                const filter = {
                    operator: o,
                    value: [ctx.filter, ctx.anotherFilter]
                }
                const filter1 = env.filterParser.parseFilter(ctx.filter)[0]
                const filter2 = env.filterParser.parseFilter(ctx.anotherFilter)[0]
                expect( env.filterParser.parseFilter(filter) ).toEqual([
                    filter1,
                    filter2
                ])
            })
        })

            // test(`correctly transform operator [$not]`, () => {
            //     const filter = {
            //         operator: '$not',
            //         value: ctx.filter
            //     }
            //     expect( env.filterParser.parseFilter(filter) ).toEqual([{
            //         filterExpr: `NOT (${env.filterParser.parseFilter(ctx.filter)[0].filterExpr})`,
            //         parameters: env.filterParser.parseFilter(ctx.filter)[0].parameters
            //     }])
            // })


        // describe('aggregation functions', () => {

        //     describe('transform select fields', () => {
        //         test(`single id field`, () => {
        //             const aggregation = {
        //                 _id: ctx.fieldName
        //             }

        //             expect( env.filterParser.parseAggregation(aggregation) ).toEqual({
        //                 fieldsStatement: escapeId(ctx.fieldName),
        //                 groupByColumns: [ctx.fieldName],
        //                 havingFilter: '',
        //                 parameters: { }
        //             })
        //         })

        //         test(`multiple id fields`, () => {
        //             const aggregation = {
        //                 _id: {
        //                     field1: ctx.fieldName,
        //                     field2: ctx.anotherFieldName
        //                 }
        //             }

        //             expect( env.filterParser.parseAggregation(aggregation) ).toEqual({
        //                 fieldsStatement: `${escapeId(ctx.fieldName)}, ${escapeId(ctx.anotherFieldName)}`,
        //                 groupByColumns: [ctx.fieldName, ctx.anotherFieldName],
        //                 havingFilter: '',
        //                 parameters: {},
        //             })
        //         })

        //         test(`process having filter`, () => {
        //             const aggregation = {
        //                 _id: ctx.fieldName,
        //                 [ctx.moreFieldName]: {
        //                     '$avg': ctx.anotherFieldName
        //                 }
        //             }

        //             const havingFilter = { operator: '$gt', fieldName: ctx.moreFieldName, value: ctx.fieldValue}

        //             expect( env.filterParser.parseAggregation(aggregation, havingFilter) ).toEqual({
        //                 fieldsStatement: `${escapeId(ctx.fieldName)}, AVG(${escapeId(ctx.anotherFieldName)}) AS ${escapeId(ctx.moreFieldName)}`,
        //                 groupByColumns: [ctx.fieldName],
        //                 havingFilter: `HAVING AVG(${escapeId(ctx.anotherFieldName)}) > @${ctx.moreFieldName}`,
        //                 parameters: { [ctx.moreFieldName]: ctx.fieldValue },
        //             })
        //         })

        //         each([
        //             ['AVG', '$avg'],
        //             ['MIN', '$min'],
        //             ['MAX', '$max'],
        //             ['SUM', '$sum'],
        //         ]).test(`translate %s function`, (mySqlFunction, wixDataFunction) => {
        //             const aggregation = {
        //                 _id: ctx.fieldName,
        //                 [ctx.moreFieldName]: {
        //                     [wixDataFunction]: ctx.anotherFieldName
        //                 }
        //             }

        //             expect( env.filterParser.parseAggregation(aggregation) ).toEqual({
        //                 fieldsStatement: `${escapeId(ctx.fieldName)}, ${mySqlFunction}(${escapeId(ctx.anotherFieldName)}) AS ${escapeId(ctx.moreFieldName)}`,
        //                 groupByColumns: [ctx.fieldName],
        //                 havingFilter: '',
        //                 parameters: {},
        //             })
        //         })
        //     })

        // })

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

        ctx.filter = randomFilter();
        ctx.anotherFilter = randomFilter();

        ctx.offset = chance.natural({min: 2, max: 20})
    });
    
    beforeAll(function() {
        env.filterParser = new FilterParser
    });


})
