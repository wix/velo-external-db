import FilterParser from './sql_filter_transformer'
import { Uninitialized } from '@wix-velo/test-commons'
import { LastLetterCoder } from './firestore_utils'
import { randomSupportedFilter } from '../tests/gen'
import { errors } from '@wix-velo/velo-external-db-commons'
const { InvalidQuery } = errors
import each from 'jest-each'
import * as Chance from 'chance'
const chance = Chance()
import { AdapterOperators } from '@wix-velo/velo-external-db-commons'
const { eq, gt, gte, include, lt, lte, ne, string_begins, string_contains, and, urlized } = AdapterOperators

const EmptySort: any[] = []

describe('Fire Store Parser', () => {

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

    describe('filter parser', () => {})
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
                    fieldName: ctx.fieldName,
                    opStr: env.filterParser.adapterOperatorToFirestoreOperator(o, ctx.fieldValue),
                    value: ctx.fieldValue,
                }])

            })

            test('correctly extract filter value if value is 0', () => {
                const filter = {
                    operator: eq,
                    fieldName: ctx.fieldName,
                    value: 0
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    fieldName: ctx.fieldName,
                    opStr: env.filterParser.adapterOperatorToFirestoreOperator(eq, ctx.fieldValue),
                    value: 0,
                }])

            })

            test('correctly transform operator [include]', () => {
                const filter = {
                    operator: include,
                    fieldName: ctx.fieldName,
                    value: ctx.fieldListValue
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([
                {
                    fieldName: ctx.fieldName,
                    opStr: env.filterParser.adapterOperatorToFirestoreOperator(include),
                    value: ctx.fieldListValue,
                }
            
            ])
            })

            test('operator [include] with empty list of values will throw an exception', () => {
                const filter = {
                    operator: include,
                    fieldName: ctx.fieldName,
                    value: []
                }

                expect( () => env.filterParser.parseFilter(filter) ).toThrow(InvalidQuery)
            })

            test('correctly transform operator [$eq] with null value', () => {
                const filter = {
                    operator: eq,
                    fieldName: ctx.fieldName,
                    value: undefined 
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    fieldName: ctx.fieldName,
                    opStr: env.filterParser.adapterOperatorToFirestoreOperator(eq),
                    value: null
                }])
            })

            test('correctly transform operator [$eq] with boolean value', () => {
                const value = chance.bool()
                const filter = {
                    operator: eq,
                    fieldName: ctx.fieldName,
                    value
                }

                expect( env.filterParser.parseFilter(filter) ).toEqual([{
                    fieldName: ctx.fieldName,
                    opStr: env.filterParser.adapterOperatorToFirestoreOperator(eq),               
                    value
                }])
            })
        })

    describe('handle string operators', () => {
        test('operator [string_contains] will throw an exception', () => {
            const filter = {
                operator: string_contains,
                fieldName: ctx.fieldName,
                value: ctx.fieldValue
            }
            expect(() => env.filterParser.parseFilter(filter)).toThrow(InvalidQuery)
        })
            
        test('correctly transform operator [begins]', () => {
            const filter = {
                operator: string_begins,
                fieldName: ctx.fieldName,
                value: ctx.fieldValue
            }

            expect( env.filterParser.parseFilter(filter) ).toEqual([
                { fieldName: ctx.fieldName, opStr: '>=', value: ctx.fieldValue, },
                { fieldName: ctx.fieldName, opStr: '<', value: ctx.fieldValue + LastLetterCoder }
            ])
        })

        test('operator [urlized] will throw an exception', () => {
            const filter = {
                operator: urlized,
                fieldName: ctx.fieldName,
                value: ctx.fieldListValue
            }

            expect(() => env.filterParser.parseFilter(filter)).toThrow(InvalidQuery)

        })
    })

    describe('handle multi field operator', () => {
        each([ and ]).test('correctly transform operator [%s]', (o) => {
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

        ctx.filter = randomSupportedFilter()
        ctx.anotherFilter = randomSupportedFilter()

        ctx.offset = chance.natural({ min: 2, max: 20 })
    })
    
    beforeAll(function() {
        env.filterParser = new FilterParser
    })

})


