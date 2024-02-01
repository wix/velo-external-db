import each from 'jest-each'
import { Uninitialized, gen as genCommon } from '@wix-velo/test-commons'
import { AdapterOperators } from '@wix-velo/velo-external-db-commons'
import { WixDataMultiFieldOperators, WixDataSingleFieldOperators } from '@wix-velo/velo-external-db-types'
import { errors } from '@wix-velo/velo-external-db-commons'
import * as gen from '../../test/gen'
import FilterTransformer from './filter_transformer'
import { EmptyFilter } from './utils'
import Chance = require('chance')
const chance = Chance()
const { InvalidQuery } = errors

describe('Filter Transformer', () => {
    beforeAll(() => {
        env.FilterTransformer = new FilterTransformer
    })
    describe('correctly transform Wix operators to adapter operators', () => {
        each([
            '$eq', '$ne', '$lt', '$lte', '$gt', '$gte', '$or', '$and', '$not', '$urlized'
        ])
            .test('correctly transform [%s]', (o: string) => {
                const adapterOperator = o.substring(1)
                expect(env.FilterTransformer.wixOperatorToAdapterOperator(o)).toEqual((AdapterOperators as any)[adapterOperator]) 
            })

        test('correctly transform [$hasSome]', () => {
            expect(env.FilterTransformer.wixOperatorToAdapterOperator('$hasSome')).toEqual(AdapterOperators.include)
        })

        test('correctly transform [$contains]', () => {
            expect(env.FilterTransformer.wixOperatorToAdapterOperator('$contains')).toEqual(AdapterOperators.string_contains)
        })

        test('correctly transform [$startsWith]', () => {
            expect(env.FilterTransformer.wixOperatorToAdapterOperator('$startsWith')).toEqual(AdapterOperators.string_begins)
        })

        test('correctly transform [$endsWith]', () => {
            expect(env.FilterTransformer.wixOperatorToAdapterOperator('$endsWith')).toEqual(AdapterOperators.string_ends)
        })

        test('transform unknown operator will throw an exception', () => {
            expect( () => env.FilterTransformer.wixOperatorToAdapterOperator('$wrong')).toThrow(InvalidQuery)
        })
    })

    test('handles undefined filter', () => {
        expect(env.FilterTransformer.transform('')).toEqual(EmptyFilter)
        expect(env.FilterTransformer.transform(undefined)).toEqual(EmptyFilter)
        expect(env.FilterTransformer.transform(null)).toEqual(EmptyFilter)
        expect(env.FilterTransformer.transform(555)).toEqual(EmptyFilter)

    })

    test('handles empty filter', () => {
        expect(env.FilterTransformer.transform({})).toEqual(EmptyFilter)
        expect(env.FilterTransformer.transform([])).toEqual(EmptyFilter)
    })

    describe('handle single field operator', () => {
        each([
            '$ne', '$lt', '$lte', '$gt', '$gte', '$eq'
        ]).test('correctly transform operator [%s]', (o: any) => {
            expect(env.FilterTransformer.transform(
                { [ctx.fieldName]: { [o]: ctx.fieldValue } }
            ))
                .toEqual({ fieldName: ctx.fieldName, operator: env.FilterTransformer.wixOperatorToAdapterOperator(o), value: ctx.fieldValue })
        })

        test('correctly transform operator [$hasSome]', () => {
            expect(env.FilterTransformer.transform(
                { [ctx.fieldName]: { $hasSome: ctx.fieldListValue } }
            ))
                .toEqual({
                    fieldName: ctx.fieldName, operator: env.FilterTransformer.wixOperatorToAdapterOperator('$hasSome'), value: ctx.fieldListValue
                })
        })

        describe('handle string operators', () => {
            test('correctly transform operator [$contains]', () => {
                const filter = {
                    [ctx.fieldName]: { $contains: ctx.fieldValue }
                }
                expect(env.FilterTransformer.transform(filter)).toEqual({
                    fieldName: ctx.fieldName, operator: env.FilterTransformer.wixOperatorToAdapterOperator('$contains'), value: ctx.fieldValue
                })
            })

            test('correctly transform operator [$startsWith]', () => {
                const filter = {
                    [ctx.fieldName]: { $startsWith: ctx.fieldValue }
                }
                expect(env.FilterTransformer.transform(filter)).toEqual({
                    fieldName: ctx.fieldName, operator: env.FilterTransformer.wixOperatorToAdapterOperator('$startsWith'), value: ctx.fieldValue
                })
            })

            test('correctly transform operator [$endsWith]', () => {
                const filter = {
                    [ctx.fieldName]: { $endsWith: ctx.fieldValue }
                }
                expect(env.FilterTransformer.transform(filter)).toEqual({
                    fieldName: ctx.fieldName, operator: env.FilterTransformer.wixOperatorToAdapterOperator('$endsWith'), value: ctx.fieldValue
                })
            })
        })

    })

    describe('handle filter by date', () => {
        test('transform velo date to date object', () => {
            const filter = {
                [ctx.fieldName]: { $gt: ctx.veloDate }
            }
            expect(env.FilterTransformer.transform(filter)).toEqual({
                fieldName: ctx.fieldName, operator: env.FilterTransformer.wixOperatorToAdapterOperator('$gt'), value: new Date(genCommon.veloDate().$date)
            })
        })
    })

    describe('handle multi field operator', () => {
        each([
            '$and', '$or'
        ]).test('correctly transform operator [%s]', (o: any) => {
            const filter = {
                [o]: [ctx.filter, ctx.anotherFilter]
            }
            const filter1 = env.FilterTransformer.transform(ctx.filter)
            const filter2 = env.FilterTransformer.transform(ctx.anotherFilter)

            expect(env.FilterTransformer.transform(filter)).toEqual({
                operator: env.FilterTransformer.wixOperatorToAdapterOperator(o),
                value: [filter1, filter2]
            })
        })

        test('correctly transform operator [$not]', () => {
            const filter = {
                $not: [ctx.filter]
            }

            expect(env.FilterTransformer.transform(filter)).toEqual({
                operator: env.FilterTransformer.wixOperatorToAdapterOperator('$not'),
                value: [env.FilterTransformer.transform(ctx.filter)]
            })
        })
    }), 

    describe('transform sort', () => { 
        test('should handle wrong sort', () => {
            expect(env.FilterTransformer.transformSort('')).toEqual([])
            expect(env.FilterTransformer.transformSort(undefined)).toEqual([])
            expect(env.FilterTransformer.transformSort(null)).toEqual([])
        })

        test('transform empty sort', () => {
            expect(env.FilterTransformer.transformSort([])).toEqual([])
        })

        test('transform sort', () => {
            const sort = [
                { fieldName: ctx.fieldName, order: 'ASC' },
            ]
            expect(env.FilterTransformer.transformSort(sort)).toEqual([{
                fieldName: ctx.fieldName,
                direction: 'asc'
            }])
        })

        test('transform sort with multiple fields', () => {
            const sort = [
                { fieldName: ctx.fieldName, order: 'ASC' },
                { fieldName: ctx.anotherFieldName, order: 'DESC' },
            ]
            expect(env.FilterTransformer.transformSort(sort)).toEqual([{
                fieldName: ctx.fieldName,
                direction: 'asc'
            }, {
                fieldName: ctx.anotherFieldName,
                direction: 'desc'
            }])
        })
    })

    describe('handle short syntax filter', () => {
        test('correctly transform short syntax filter', () => {
            const filter = {
                [ctx.fieldName]: ctx.fieldValue
            }
            expect(env.FilterTransformer.transform(filter)).toEqual({
                fieldName: ctx.fieldName,
                operator: env.FilterTransformer.wixOperatorToAdapterOperator('$eq'),
                value: ctx.fieldValue
            })
        })

        test('correctly transform short syntax filter with object value', () => {
            const filter = {
                [ctx.fieldName]: ctx.objectValue
            }
            expect(env.FilterTransformer.transform(filter)).toEqual({
                fieldName: ctx.fieldName,
                operator: env.FilterTransformer.wixOperatorToAdapterOperator('$eq'),
                value: ctx.objectValue
            })
        })

        test('correctly transform short syntax filter with encrypted value', () => {
            const filter = {
                [ctx.fieldName]: { $encrypted: ctx.fieldValue }
            }
            expect(env.FilterTransformer.transform(filter)).toEqual({
                fieldName: ctx.fieldName,
                operator: env.FilterTransformer.wixOperatorToAdapterOperator('$eq'),
                value: { $encrypted: ctx.fieldValue }
            })
        })
    })

    interface Enviorment {
        FilterTransformer: FilterTransformer
    }

    const env: Enviorment = {
        FilterTransformer: Uninitialized
    }

    const ctx = {
        filter: Uninitialized,
        anotherFilter: Uninitialized,
        fieldName: Uninitialized,
        anotherFieldName: Uninitialized,
        fieldValue: Uninitialized,
        operator: Uninitialized,
        fieldListValue: Uninitialized,
        veloDate: Uninitialized,
        objectValue: Uninitialized,
    }

    beforeEach(() => {
        ctx.filter = gen.randomFilter()
        ctx.anotherFilter = gen.randomFilter()
        ctx.fieldName = chance.word()
        ctx.anotherFieldName = chance.word()
        ctx.fieldValue = chance.word()
        ctx.operator = gen.randomOperator() as WixDataMultiFieldOperators | WixDataSingleFieldOperators
        ctx.fieldListValue = [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()]
        ctx.veloDate = genCommon.veloDate()
        ctx.objectValue = genCommon.randomObject()
    })
})

