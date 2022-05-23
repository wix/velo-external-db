const each = require('jest-each').default
const Chance = require('chance')
const chance = Chance()
const { Uninitialized } = require('test-commons')
const { givenBodyWith } = require('../../velo-external-db/test/drivers/hooks_test_support')
const { HooksForAction, Operations, payloadFor, Actions } = require('./data_hooks_utils')

describe('Hooks Utils', () => {
    describe('Hooks For Action', () => {
        describe('Before Read', () => {
            each([Actions.BeforeFind, Actions.BeforeAggregate, Actions.BeforeCount, Actions.BeforeGetById])
                .test('Hooks action for %s should return appropriate array', (action) => {
                    expect(HooksForAction[action]).toEqual(['beforeAll', 'beforeRead', action])
                })
        })
        describe('After Read', () => {
            each([Actions.AfterFind, Actions.AfterAggregate, Actions.AfterCount, Actions.AfterGetById])
                .test('Hooks action for %s should return appropriate array', (action) => {
                    expect(HooksForAction[action]).toEqual(['afterAll', 'afterRead', action])
                })
        })
        describe('Before Write', () => {
            each([Actions.BeforeInsert, Actions.BeforeBulkInsert, Actions.BeforeUpdate, Actions.BeforeBulkUpdate, Actions.BeforeRemove, Actions.BeforeBulkRemove])
                .test('Hooks action for %s should return appropriate array', (action) => {
                    expect(HooksForAction[action]).toEqual(['beforeAll', 'beforeWrite', action])
                })
        })
        describe('After Write', () => {
            each([Actions.AfterInsert, Actions.AfterBulkInsert, Actions.AfterUpdate, Actions.AfterBulkUpdate, Actions.AfterRemove, Actions.AfterBulkRemove])
                .test('Hooks action for %s should return appropriate array', (action) => {
                    expect(HooksForAction[action]).toEqual(['afterAll', 'afterWrite', action])
                })
        })
    })

    describe('Payload For', () => {
        test('Payload for Find should return query object', () => {
            expect(payloadFor(Operations.Find, givenBodyWith({ filter: ctx.filter, skip: ctx.skip, limit: ctx.limit, sort: ctx.sort }))).toEqual({
                filter: ctx.filter,
                skip: ctx.skip,
                limit: ctx.limit,
                sort: ctx.sort
            })
        })
        test('Payload for Insert should return item', () => {
            expect(payloadFor(Operations.Insert, givenBodyWith({ item: ctx.item }))).toEqual(ctx.item)
        })
        test('Payload for BulkInsert should return items', () => {
            expect(payloadFor(Operations.BulkInsert, givenBodyWith({ items: ctx.items }))).toEqual(ctx.items)
        })
        test('Payload for Update should return item', () => {
            expect(payloadFor(Operations.Update, givenBodyWith({ item: ctx.item }))).toEqual(ctx.item)
        })
        test('Payload for BulkUpdate should return items', () => {
            expect(payloadFor(Operations.BulkUpdate, givenBodyWith({ items: ctx.items }))).toEqual(ctx.items)
        })
        test('Payload for Remove should return item id', () => {
            expect(payloadFor(Operations.Remove, givenBodyWith({ itemId: ctx.itemId }))).toEqual(ctx.itemId)
        })
        test('Payload for BulkRemove should return item ids', () => {
            expect(payloadFor(Operations.BulkRemove, givenBodyWith({ itemIds: ctx.itemIds }))).toEqual(ctx.itemIds)
        })
        test('Payload for Count should return filter', () => {
            expect(payloadFor(Operations.Count, givenBodyWith({ filter: ctx.filter }))).toEqual(ctx.filter)
        })
        test('Payload for Get should return item id', () => {
            expect(payloadFor(Operations.Get, givenBodyWith({ itemId: ctx.itemId }))).toEqual(ctx.itemId)
        })
        test('Payload for Aggregate should return Aggregation query', () => {
            expect(payloadFor(Operations.Aggregate, givenBodyWith({ filter: ctx.filter, processingStep: ctx.processingStep, postFilteringStep: ctx.postFilteringStep })))
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
        item: Uninitialized,
        items: Uninitialized,
        itemId: Uninitialized,
        itemIds: Uninitialized
    }

    beforeEach(() => {
        ctx.filter = chance.word()
        ctx.limit = chance.word()
        ctx.skip = chance.word()
        ctx.sort = chance.word()
        ctx.item = chance.word()
        ctx.items = chance.word()
        ctx.itemId = chance.word()
        ctx.itemIds = chance.word()
    })
})