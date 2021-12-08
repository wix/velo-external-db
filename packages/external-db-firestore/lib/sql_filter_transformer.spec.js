const FilterParser = require('./sql_filter_transformer')
const { Uninitialized } = require('test-commons')
const { InvalidQuery } = require('velo-external-db-commons').errors
const each = require('jest-each').default
const Chance = require('chance')
const chance = Chance()

const EMPTY_SORT = []

const randomV2Filter = () => {
    const op = chance.pickone(['$ne', '$lt', '$lte', '$gt', '$gte', '$hasSome', '$eq', '$startsWith', '$endsWith'])
    const fieldName = chance.word()
    const value = op === '$hasSome' ? [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()] : chance.word()
    return {
        [fieldName]: { [op]: value }
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
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName, direction: 'asc' }) ).toEqual([{ fieldName: ctx.fieldName, direction: 'asc' }])
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName, direction: 'aSc' }) ).toEqual([{ fieldName: ctx.fieldName, direction: 'asc' }])
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName, direction: 'desc' }) ).toEqual([{ fieldName: ctx.fieldName, direction: 'desc' }])
            expect( env.filterParser.parseSort({ fieldName: ctx.fieldName }) ).toEqual([{ fieldName: ctx.fieldName, direction: 'asc' }])
        })

        test('process single sort with valid expression', () => {
            expect( env.filterParser.orderBy([{ fieldName: ctx.fieldName, direction: 'asc' }]) ).toEqual([{ fieldName: ctx.fieldName, direction: 'asc' }])
        })

        test('process single sort with two valid expression', () => {
            expect( env.filterParser.orderBy([{ fieldName: ctx.fieldName, direction: 'asc' },
                { fieldName: ctx.anotherFieldName, direction: 'desc' }]) ).toEqual([{ fieldName: ctx.fieldName, direction: 'asc' }, { fieldName: ctx.anotherFieldName, direction: 'desc' }])
        })

        test('process single sort with one valid and one invalid expression', () => {
            expect( env.filterParser.orderBy([{ fieldName: ctx.fieldName, direction: 'asc' },
                { invalid: 'object' }]) ).toEqual([{ fieldName: ctx.fieldName, direction: 'asc' }])
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
            expect( env.filterParser.transform(ctx.filter) ).toEqual([{
                fieldName: env.filterParser.parseFilter(ctx.filter)[0].fieldName,
                opStr: env.filterParser.parseFilter(ctx.filter)[0].opStr,
                value: env.filterParser.parseFilter(ctx.filter)[0].value
            }])
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
                    fieldName: ctx.fieldName,
                    opStr: env.filterParser.veloOperatorToFirestoreOperator(o, ctx.fieldValue),
                    value: ctx.fieldValue,
                }])

            })

            test('correctly extract filter value if value is 0', () => {
                const filter = {
                    [ctx.fieldName]: { $eq: 0 }
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    fieldName: ctx.fieldName,
                    opStr: env.filterParser.veloOperatorToFirestoreOperator('$eq', ctx.fieldValue),
                    value: 0,
                }])

            })

            test('correctly transform operator [$hasSome]', () => {
                const filter = {
                    [ctx.fieldName]: { $hasSome: ctx.fieldListValue }
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([
                {
                    fieldName: ctx.fieldName,
                    opStr: env.filterParser.veloOperatorToFirestoreOperator('$hasSome'),
                    value: ctx.fieldListValue,
                }
            
            ])
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
                    fieldName: ctx.fieldName,
                    opStr: env.filterParser.veloOperatorToFirestoreOperator('$eq'),
                    value: null
                }])
            })

            test('correctly transform operator [$eq] with boolean value', () => {
                const value = chance.bool()
                const filter = {
                    [ctx.fieldName]: { $eq: value } 
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    fieldName: ctx.fieldName,
                    opStr: env.filterParser.veloOperatorToFirestoreOperator('$eq'),               
                    value
                }])
            })

            describe('handle string operators', () => {
                test('operator [$contains] will throw an exception', () => {
                    const filter = {
                        [ctx.fieldName]: { $contains: ctx.fieldValue }
                    }

                    expect(() => env.filterParser.parseFilter(filter)).toThrow(InvalidQuery)
                })

                each([
                    '$startsWith', '$endsWith',
                ]).test('correctly transform operator [%s]', (o) => {
                    const filter = {
                        [ctx.fieldName]: { [o]: ctx.fieldValue }
                    }

                    expect( env.filterParser.parseFilter(filter) ).toEqual([{
                        fieldName: ctx.fieldName,
                        opStr: env.filterParser.veloOperatorToFirestoreOperator(o, ctx.fieldValue),
                        value: ctx.fieldValue,
                    }])

                })

                test('correctly transform operator [$urlized]', () => {
                    const filter = {
                        [ctx.fieldName]: { $urlized: ctx.fieldListValue } 
                    }

                    expect(() => env.filterParser.parseFilter(filter)).toThrow(InvalidQuery)

                })
            
        })

        describe('handle multi field operator', () => {
            each([
                '$and'
            ]).test('correctly transform operator [%s]', (o) => {
                const filter = {
                    [o]: [ctx.filter, ctx.anotherFilter]
                }
                const filter1 = env.filterParser.parseFilter(ctx.filter)[0]
                const filter2 = env.filterParser.parseFilter(ctx.anotherFilter)[0]
                expect( env.filterParser.parseFilter(filter) ).toEqual([
                    filter1,
                    filter2
                ])
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

        ctx.filter = randomV2Filter()
        ctx.anotherFilter = randomV2Filter()

        ctx.offset = chance.natural({ min: 2, max: 20 })
    })
    
    beforeAll(function() {
        env.filterParser = new FilterParser
    })


})
