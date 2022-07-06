import each from 'jest-each'
import * as Chance from 'chance'
import { Uninitialized } from '@wix-velo/test-commons'
import { randomBodyWith } from '../test/gen'
import { DataHooksForAction, DataOperations, dataPayloadFor, DataActions } from './data_hooks_utils'
const chance = Chance()

describe('Hooks Utils', () => {
    describe('Hooks For Action', () => {
        describe('Before Read', () => {
            each([DataActions.BeforeFind, DataActions.BeforeAggregate, DataActions.BeforeCount, DataActions.BeforeGetById])
                .test('Hooks action for %s should return appropriate array', (action) => {
                    expect(DataHooksForAction[action]).toEqual(['beforeAll', 'beforeRead', action])
                })
        })
        describe('After Read', () => {
            each([DataActions.AfterFind, DataActions.AfterAggregate, DataActions.AfterCount, DataActions.AfterGetById])
                .test('Hooks action for %s should return appropriate array', (action) => {
                    expect(DataHooksForAction[action]).toEqual(['afterAll', 'afterRead', action])
                })
        })
        describe('Before Write', () => {
            each([DataActions.BeforeInsert, DataActions.BeforeBulkInsert, DataActions.BeforeUpdate, DataActions.BeforeBulkUpdate, DataActions.BeforeRemove, DataActions.BeforeBulkRemove])
                .test('Hooks action for %s should return appropriate array', (action) => {
                    expect(DataHooksForAction[action]).toEqual(['beforeAll', 'beforeWrite', action])
                })
        })
        describe('After Write', () => {
            each([DataActions.AfterInsert, DataActions.AfterBulkInsert, DataActions.AfterUpdate, DataActions.AfterBulkUpdate, DataActions.AfterRemove, DataActions.AfterBulkRemove])
                .test('Hooks action for %s should return appropriate array', (action) => {
                    expect(DataHooksForAction[action]).toEqual(['afterAll', 'afterWrite', action])
                })
        })
    })

    describe('Payload For', () => {
        test('Payload for Find should return query object', () => {
            expect(dataPayloadFor(DataOperations.Find, randomBodyWith({ filter: ctx.filter, skip: ctx.skip, limit: ctx.limit, sort: ctx.sort, projection: ctx.projection }))).toEqual({
                filter: ctx.filter,
                skip: ctx.skip,
                limit: ctx.limit,
                sort: ctx.sort,
                projection: ctx.projection,
            })
        })
        test('Payload for Insert should return item', () => {
            expect(dataPayloadFor(DataOperations.Insert, randomBodyWith({ item: ctx.item }))).toEqual({ item: ctx.item })
        })
        test('Payload for BulkInsert should return items', () => {
            expect(dataPayloadFor(DataOperations.BulkInsert, randomBodyWith({ items: ctx.items }))).toEqual({ items: ctx.items })
        })
        test('Payload for Update should return item', () => {
            expect(dataPayloadFor(DataOperations.Update, randomBodyWith({ item: ctx.item }))).toEqual({ item: ctx.item })
        })
        test('Payload for BulkUpdate should return items', () => {
            expect(dataPayloadFor(DataOperations.BulkUpdate, randomBodyWith({ items: ctx.items }))).toEqual({ items: ctx.items })
        })
        test('Payload for Remove should return item id', () => {
            expect(dataPayloadFor(DataOperations.Remove, randomBodyWith({ itemId: ctx.itemId }))).toEqual({ itemId: ctx.itemId })
        })
        test('Payload for BulkRemove should return item ids', () => {
            expect(dataPayloadFor(DataOperations.BulkRemove, randomBodyWith({ itemIds: ctx.itemIds }))).toEqual({ itemIds: ctx.itemIds })
        })
        test('Payload for Count should return filter', () => {
            expect(dataPayloadFor(DataOperations.Count, randomBodyWith({ filter: ctx.filter }))).toEqual({ filter: ctx.filter })
        })
        test('Payload for Get should return item id and projection', () => {
            expect(dataPayloadFor(DataOperations.Get, randomBodyWith({ itemId: ctx.itemId, projection: ctx.projection }))).toEqual({ itemId: ctx.itemId, projection: ctx.projection })
        })
        test('Payload for Aggregate should return Aggregation query', () => {
            expect(dataPayloadFor(DataOperations.Aggregate, randomBodyWith({ filter: ctx.filter, processingStep: ctx.processingStep, postFilteringStep: ctx.postFilteringStep })))
                .toEqual(
                    {
                        filter: ctx.filter,
                        processingStep: ctx.processingStep,
                        postFilteringStep: ctx.postFilteringStep
                    }
                )
        })
    })


    const ctx = {
        filter: Uninitialized,
        limit: Uninitialized,
        skip: Uninitialized,
        sort: Uninitialized,
        projection: Uninitialized,
        item: Uninitialized,
        items: Uninitialized,
        itemId: Uninitialized,
        itemIds: Uninitialized,
        processingStep: Uninitialized,
        postFilteringStep: Uninitialized
    }

    beforeEach(() => {
        ctx.filter = chance.word()
        ctx.limit = chance.word()
        ctx.skip = chance.word()
        ctx.sort = chance.word()
        ctx.projection = chance.word()
        ctx.item = chance.word()
        ctx.items = chance.word()
        ctx.itemId = chance.word()
        ctx.itemIds = chance.word()
    })
})