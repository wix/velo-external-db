const each = require('jest-each').default
const Chance = require('chance')
const chance = Chance()
const { Uninitialized } = require('test-commons')
const { givenBodyWith } = require('../../velo-external-db/test/drivers/hooks_test_support')
const { hooksForAction, Operations, payloadFor, Actions } = require('./hooks_utils')

describe('Hooks Utils', () => {
    describe('Hooks For Action', () => {
        describe('Before Read', () => {
            each([Actions.BeforeFind, Actions.BeforeAggregate, Actions.BeforeCount, Actions.BeforeGetById])
                .test('Hooks action for %s should return appropriate array', (action) => {
                    expect(hooksForAction(action)).toEqual(['beforeAll', 'beforeRead', action])
                })
        })
        describe('After Read', () => {
            each([Actions.AfterFind, Actions.AfterAggregate, Actions.AfterCount, Actions.AfterGetById])
                .test('Hooks action for %s should return appropriate array', (action) => {
                    expect(hooksForAction(action)).toEqual(['afterAll', 'afterRead', action])
                })
        })
        describe('Before Write', () => {
            each([Actions.BeforeInsert, Actions.BeforeBulkInsert, Actions.BeforeUpdate, Actions.BeforeBulkUpdate, Actions.BeforeRemove, Actions.BeforeBulkRemove])
                .test('Hooks action for %s should return appropriate array', (action) => {
                    expect(hooksForAction(action)).toEqual(['beforeAll', 'beforeWrite', action])
                })
        })
        describe('After Write', () => {
            each([Actions.AfterInsert, Actions.AfterBulkInsert, Actions.AfterUpdate, Actions.AfterBulkUpdate, Actions.AfterRemove, Actions.AfterBulkRemove])
                .test('Hooks action for %s should return appropriate array', (action) => {
                    expect(hooksForAction(action)).toEqual(['afterAll', 'afterWrite', action])
                })
        })
    })

    describe('Payload For', () => {
        test('Payload for FIND should return query object', () => {
            expect(payloadFor(Operations.FIND, givenBodyWith({ filter: ctx.filter, skip: ctx.skip, limit: ctx.limit, sort: ctx.sort }))).toEqual({
                filter: ctx.filter,
                skip: ctx.skip,
                limit: ctx.limit,
                sort: ctx.sort
            })
        })
        test('Payload for INSERT should return item', () => {
            expect(payloadFor(Operations.INSERT, givenBodyWith({ item: ctx.item }))).toEqual(ctx.item)
        })
        test('Payload for BULK_INSERT should return items', () => {
            expect(payloadFor(Operations.BULK_INSERT, givenBodyWith({ items: ctx.items }))).toEqual(ctx.items)
        })
        test('Payload for UPDATE should return item', () => {
            expect(payloadFor(Operations.UPDATE, givenBodyWith({ item: ctx.item }))).toEqual(ctx.item)
        })
        test('Payload for BULK_UPDATE should return items', () => {
            expect(payloadFor(Operations.BULK_UPDATE, givenBodyWith({ items: ctx.items }))).toEqual(ctx.items)
        })
        test('Payload for REMOVE should return item id', () => {
            expect(payloadFor(Operations.REMOVE, givenBodyWith({ itemId: ctx.itemId }))).toEqual(ctx.itemId)
        })
        test('Payload for BULK_REMOVE should return item ids', () => {
            expect(payloadFor(Operations.BULK_REMOVE, givenBodyWith({ itemIds: ctx.itemIds }))).toEqual(ctx.itemIds)
        })
        test('Payload for COUNT should return filter', () => {
            expect(payloadFor(Operations.COUNT, givenBodyWith({ filter: ctx.filter }))).toEqual(ctx.filter)
        })
        test('Payload for GET should return item id', () => {
            expect(payloadFor(Operations.GET, givenBodyWith({ itemId: ctx.itemId }))).toEqual(ctx.itemId)
        })
        test('Payload for AGGREGATE should return Aggregation query', () => {
            expect(payloadFor(Operations.AGGREGATE, givenBodyWith({ filter: ctx.filter, processingStep: ctx.processingStep, postFilteringStep: ctx.postFilteringStep })))
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