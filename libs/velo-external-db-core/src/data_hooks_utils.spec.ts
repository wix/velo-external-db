import each from 'jest-each'
import * as Chance from 'chance'
import { Uninitialized } from '@wix-velo/test-commons'
import { randomBodyWith } from '../test/gen'
import { DataHooksForAction, dataPayloadFor, DataActions, requestContextFor } from './data_hooks_utils'
import { DataOperation } from '@wix-velo/velo-external-db-types'

const { query: Query, insert: Insert, update: Update, remove: Remove, count: Count, aggregate: Aggregate } = DataOperation

const chance = Chance()

describe('Hooks Utils', () => {
    describe('Hooks For Action', () => {
        describe('Before Read', () => {
            each([DataActions.BeforeQuery, DataActions.BeforeAggregate, DataActions.BeforeCount])
                .test('Hooks action for %s should return appropriate array', (action) => {
                    expect(DataHooksForAction[action]).toEqual(['beforeAll', 'beforeRead', action])
                })
        })
        describe('After Read', () => {
            each([DataActions.AfterQuery, DataActions.AfterAggregate, DataActions.AfterCount])
                .test('Hooks action for %s should return appropriate array', (action) => {
                    expect(DataHooksForAction[action]).toEqual(['afterAll', 'afterRead', action])
                })
        })
        describe('Before Write', () => {
            each([DataActions.BeforeInsert, DataActions.BeforeUpdate, DataActions.BeforeRemove, DataActions.BeforeTruncate])
                .test('Hooks action for %s should return appropriate array', (action) => {
                    expect(DataHooksForAction[action]).toEqual(['beforeAll', 'beforeWrite', action])
                })
        })
        describe('After Write', () => {
            each([DataActions.AfterInsert, DataActions.AfterUpdate, DataActions.AfterRemove, DataActions.AfterTruncate])
                .test('Hooks action for %s should return appropriate array', (action) => {
                    expect(DataHooksForAction[action]).toEqual(['afterAll', 'afterWrite', action])
                })
        })
    })

    describe('Payload For', () => {
        test('Payload for Find should return query request object', () => {
            expect(dataPayloadFor(Query, ctx.bodyWithAllProps))
                .toEqual({
                    collectionId: ctx.collectionId,
                    namespace: ctx.namespace,
                    query: ctx.query,
                    includeReferencedItems: ctx.includeReferencedItems,
                    omitTotalCount: ctx.omitTotalCount,
                    options: ctx.options
                })
        })

        test('Payload for Insert should return insert request object', () => {
            expect(dataPayloadFor(Insert, ctx.bodyWithAllProps))
                .toEqual({
                    collectionId: ctx.collectionId,
                    namespace: ctx.namespace,
                    items: ctx.items,
                    overwriteExisting: ctx.overwriteExisting,
                    options: ctx.options
                })
        })

        test('Payload for Update should return update request object', () => {
            expect(dataPayloadFor(Update, ctx.bodyWithAllProps))
                .toEqual({
                    collectionId: ctx.collectionId,
                    namespace: ctx.namespace,
                    items: ctx.items,
                    options: ctx.options
                })
        })

        test('Payload for Remove should return remove request object', () => {
            expect(dataPayloadFor(Remove, ctx.bodyWithAllProps))
                .toEqual({
                    collectionId: ctx.collectionId,
                    namespace: ctx.namespace,
                    itemIds: ctx.itemIds,
                    options: ctx.options
                })
        })

        test('Payload for Count should return count request object', () => {
            expect(dataPayloadFor(Count, ctx.bodyWithAllProps))
                .toEqual({
                    collectionId: ctx.collectionId,
                    namespace: ctx.namespace,
                    filter: ctx.filter,
                    options: ctx.options
                })
        })

        test('Payload for Aggregate should return aggregate request object', () => {
            expect(dataPayloadFor(Aggregate, ctx.bodyWithAllProps))
                .toEqual({
                    collectionId: ctx.collectionId,
                    namespace: ctx.namespace,
                    initialFilter: ctx.initialFilter,
                    distinct: ctx.distinct,
                    group: ctx.group,
                    finalFilter: ctx.finalFilter,
                    sort: ctx.sort,
                    paging: ctx.paging,
                    cursorPaging: ctx.cursorPaging,
                    options: ctx.options,
                    omitTotalCount: ctx.omitTotalCount
                })
        })
    })

    describe('requestContextFor', () => {
        test('should return request context object', () => {
            expect(requestContextFor(ctx.randomOperation, ctx.bodyWithAllProps, { metaSiteId: ctx.metaSiteId }))
                .toEqual({
                    metaSiteId: ctx.metaSiteId,
                    collectionIds: [ctx.collectionId],
                    operation: ctx.randomOperation,
                })
        })
    })

    const ctx = {
        filter: Uninitialized,
        sort: Uninitialized,
        items: Uninitialized,
        itemIds: Uninitialized,
        group: Uninitialized,
        finalFilter: Uninitialized,
        distinct: Uninitialized,
        paging: Uninitialized,
        collectionId: Uninitialized,
        namespace: Uninitialized,
        query: Uninitialized,
        includeReferencedItems: Uninitialized,
        omitTotalCount: Uninitialized,
        options: Uninitialized,
        overwriteExisting: Uninitialized,
        bodyWithAllProps: Uninitialized,
        cursorPaging: Uninitialized,
        initialFilter: Uninitialized,
        randomOperation: Uninitialized,
        metaSiteId: Uninitialized,
    }

    beforeEach(() => {
        ctx.filter = chance.word()
        ctx.sort = chance.word()
        ctx.items = chance.word()
        ctx.itemIds = chance.word()
        ctx.group = chance.word()
        ctx.finalFilter = chance.word()
        ctx.distinct = chance.word()
        ctx.paging = chance.word()
        ctx.collectionId = chance.word()
        ctx.namespace = chance.word()
        ctx.query = chance.word()
        ctx.includeReferencedItems = chance.word()
        ctx.omitTotalCount = chance.word()
        ctx.options = chance.word()
        ctx.overwriteExisting = chance.word()
        ctx.cursorPaging = chance.word()
        ctx.initialFilter = chance.word()
        ctx.bodyWithAllProps = randomBodyWith({
            ...ctx
        })
        ctx.randomOperation = chance.pickone([Query, Insert, Update, Remove, Count, Aggregate])
        ctx.metaSiteId = chance.word()
    })
})
