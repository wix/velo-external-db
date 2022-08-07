import each from 'jest-each'
import Chance = require('chance')
import { Uninitialized } from '@wix-velo/test-commons'
import { AdapterFunctions } from '@wix-velo/velo-external-db-types'
import { errors } from '@wix-velo/velo-external-db-commons'
import AggregationTransformer from './aggregation_transformer'
import { EmptyFilter } from './utils'
import * as driver from '../../test/drivers/filter_transformer_test_support'
const chance = Chance()
const { InvalidQuery } = errors

describe('Aggregation Transformer', () => {
    beforeAll(() => {
        env.driver = driver
        env.AggregationTransformer = new AggregationTransformer(env.driver.filterTransformer)
    })

    describe('correctly transform Wix functions to adapter functions', () => {
        each([
            '$avg', '$max', '$min', '$sum'
        ])
        .test('correctly transform [%s]', (f: string) => {
            const AdapterFunction = f.substring(1) 
            expect(env.AggregationTransformer.wixFunctionToAdapterFunction(f)).toEqual((AdapterFunctions as any)[AdapterFunction])
        })

        test('transform unknown function will throw an exception', () => {
            expect( () => env.AggregationTransformer.wixFunctionToAdapterFunction('$wrong')).toThrow(InvalidQuery)
        })
    })

    test('single id field without function or postFilter', () => {
        env.driver.stubEmptyFilterFor(null)
        
        const processingStep = { _id: `$${ctx.fieldName}` }
        const postFilteringStep = null

        expect(env.AggregationTransformer.transform({ processingStep, postFilteringStep })).toEqual({
            projection: [{ name: ctx.fieldName }],
            postFilter: EmptyFilter
        })
    })

    test('multiple id fields without function or postFilter', () => {
        env.driver.stubEmptyFilterFor(null)
        
        const processingStep = {
            _id: {
                field1: `$${ctx.fieldName}`,
                field2: `$${ctx.anotherFieldName}`
            }
        }
        const postFilteringStep = null

        expect(env.AggregationTransformer.transform({ processingStep, postFilteringStep })).toEqual({
            projection: [
                            { name: ctx.fieldName },
                            { name: ctx.anotherFieldName }
                        ],
            postFilter: EmptyFilter
        })
    })

    test('single id field with function field and without postFilter', () => {
        env.driver.stubEmptyFilterFor(null)
        
        const processingStep = {
            _id: `$${ctx.fieldName}`,
            [ctx.fieldAlias]: {
                    $avg: `$${ctx.anotherFieldName}`
                }
        }
        const postFilteringStep = null

        expect(env.AggregationTransformer.transform({ processingStep, postFilteringStep })).toEqual({
            projection: [
                            { name: ctx.fieldName }, 
                            { name: ctx.anotherFieldName, alias: ctx.fieldAlias, function: AdapterFunctions.avg }
                        ],
            postFilter: EmptyFilter
        })
    })

    test('single id field with count function and without postFilter', () => {
        env.driver.stubEmptyFilterFor(null)

        const processingStep = {
            _id: `$${ctx.fieldName}`,
            [ctx.fieldAlias]: {
                    $sum: 1
                }
        }
        const postFilteringStep = null

        expect(env.AggregationTransformer.transform({ processingStep, postFilteringStep })).toEqual({
            projection: [
                            { name: ctx.fieldName }, 
                            { alias: ctx.fieldAlias, function: AdapterFunctions.count, name: '*' }
                        ],
            postFilter: EmptyFilter
        })
    })
    
    test('multiple function fields and without postFilter', () => {
        env.driver.stubEmptyFilterFor(null)

        const processingStep = {
            _id: `$${ctx.fieldName}`,
            [ctx.fieldAlias]: {
                    $avg: `$${ctx.anotherFieldName}`
                },
                [ctx.anotherFieldAlias]: {
                    $sum: `$${ctx.moreFieldName}`
                }
        }
        const postFilteringStep = null

        expect(env.AggregationTransformer.transform({ processingStep, postFilteringStep })).toEqual({
            projection: [
                            { name: ctx.fieldName }, 
                            { name: ctx.anotherFieldName, alias: ctx.fieldAlias, function: AdapterFunctions.avg },
                            { name: ctx.moreFieldName, alias: ctx.anotherFieldAlias, function: AdapterFunctions.sum }
                        ],
            postFilter: EmptyFilter
        })
    })

    test('function and postFilter', () => {
        env.driver.givenFilterByIdWith(ctx.id, ctx.filter)

        const processingStep = {
            _id: `$${ctx.fieldName}`,
            [ctx.fieldAlias]: {
                    $avg: `$${ctx.anotherFieldName}`
                }
        }
        
        const postFilteringStep = ctx.filter

        expect(env.AggregationTransformer.transform({ processingStep, postFilteringStep })).toEqual({
            projection: [
                            { name: ctx.fieldName }, 
                            { name: ctx.anotherFieldName, alias: ctx.fieldAlias, function: AdapterFunctions.avg }
                        ],
            postFilter: env.driver.filterTransformer.transform(ctx.filter)
        })
    })

    interface Enviorment {
        driver: any
        AggregationTransformer: AggregationTransformer 
    }

    const env: Enviorment = {
        driver: Uninitialized,
        AggregationTransformer: Uninitialized
    }

    const ctx = {
        fieldName: Uninitialized,
        anotherFieldName: Uninitialized,
        moreFieldName: Uninitialized,
        fieldAlias: Uninitialized,
        anotherFieldAlias: Uninitialized,
        filter: Uninitialized,
        id: Uninitialized
    }

    beforeEach(() => {
        ctx.fieldName = chance.word()
        ctx.anotherFieldName = chance.word()
        ctx.moreFieldName = chance.word()
        ctx.fieldAlias = chance.word()
        ctx.anotherFieldAlias = chance.word()
        ctx.id = chance.guid()
        ctx.filter = {
            [ctx.fieldName]: { $eq: ctx.id }
        }
    })

    afterAll(() => {
        env.driver.reset()
    })
})
