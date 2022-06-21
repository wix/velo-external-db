import { Uninitialized } from '@wix-velo/test-commons'
import * as gen from '../../test/gen'
import FilterTransformer from './filter_transformer'
import { EmptyFilter } from './utils'
import each from 'jest-each'
import Chance = require('chance')
import { errors } from '@wix-velo/velo-external-db-commons'
const chance = Chance()
import { AdapterOperators } from '@wix-velo/velo-external-db-commons'
import { WixDataFilter, WixDataMultiFieldOperators, WixDataSingleFieldOperators } from '@wix-velo/velo-external-db-types'
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
    })

    interface Enviorment {
        FilterTransformer: any
    }

    const env: Enviorment = {
        FilterTransformer: Uninitialized
    }

    interface Context {
        filter: WixDataFilter | null
        anotherFilter: WixDataFilter | null
        fieldName: any
        fieldValue: any
        operator: WixDataMultiFieldOperators | WixDataSingleFieldOperators | null
        fieldListValue: any[] | null
    }

    const ctx: Context = {
        filter: Uninitialized,
        anotherFilter: Uninitialized,
        fieldName: Uninitialized,
        fieldValue: Uninitialized,
        operator: Uninitialized,
        fieldListValue: Uninitialized,
    }

    beforeEach(() => {
        ctx.filter = gen.randomFilter()
        ctx.anotherFilter = gen.randomFilter()
        ctx.fieldName = chance.word()
        ctx.fieldValue = chance.word()
        ctx.operator = gen.randomOperator() as WixDataMultiFieldOperators | WixDataSingleFieldOperators
        ctx.fieldListValue = [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()]
    })
})

