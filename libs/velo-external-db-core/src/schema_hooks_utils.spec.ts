import each from 'jest-each'
import * as Chance from 'chance'
import { Uninitialized } from '@wix-velo/test-commons'
import { randomBodyWith } from '../test/gen'
import { SchemaHooksForAction, schemaPayloadFor, SchemaActions } from './schema_hooks_utils'
import { CollectionOperationSPI } from '@wix-velo/velo-external-db-types'
const chance = Chance()

describe('Hooks Utils', () => {
    describe('Hooks For Action', () => {
        describe('Before Read', () => {
            each([SchemaActions.BeforeGet])
                .test('Hooks action for beforeGet should return appropriate array', (action) => {
                    expect(SchemaHooksForAction[action]).toEqual(['beforeAll', 'beforeRead', action])
                })
        })
        describe('After Read', () => {
            each([SchemaActions.AfterGet])
                .test('Hooks action for %s should return appropriate array', (action) => {
                    expect(SchemaHooksForAction[action]).toEqual(['afterAll', 'afterRead', action])
                })
        })
        describe('Before Write', () => {
            each([SchemaActions.BeforeCreate, SchemaActions.BeforeUpdate, SchemaActions.BeforeDelete])
                .test('Hooks action for %s should return appropriate array', (action) => {
                    expect(SchemaHooksForAction[action]).toEqual(['beforeAll', 'beforeWrite', action])
                })
        })
        describe('After Write', () => {
            each([SchemaActions.AfterCreate, SchemaActions.AfterUpdate, SchemaActions.AfterDelete])
                .test('Hooks action for %s should return appropriate array', (action) => {
                    expect(SchemaHooksForAction[action]).toEqual(['afterAll', 'afterWrite', action])
                })
        })
    })

    describe('Payload For', () => {
        test('Payload for get should return schemaIds', () => {
            expect(schemaPayloadFor(CollectionOperationSPI.Get, ctx.bodyWithAllProps)).toEqual({ collectionIds: ctx.collectionIds })
        })
        each([CollectionOperationSPI.Create, CollectionOperationSPI.Update])
        .test('Payload for %s should return collection', (operation) => {
            expect(schemaPayloadFor(operation, ctx.bodyWithAllProps)).toEqual({ collection: ctx.collection })
        })
        test('Payload for delete should return collectionId', () => {
            expect(schemaPayloadFor(CollectionOperationSPI.Delete, ctx.bodyWithAllProps)).toEqual({ collectionId: ctx.collectionId })
        })
    })


    const ctx = {
        collectionIds: Uninitialized,
        collectionId: Uninitialized,
        collection: Uninitialized,
        column: Uninitialized,
        columnName: Uninitialized,
        bodyWithAllProps: Uninitialized,
    }

    beforeEach(() => {
        ctx.collectionIds = chance.n(chance.word, chance.integer({ min: 1, max: 10 }))
        ctx.collectionId = chance.word()
        ctx.collection = chance.word()
        ctx.column = chance.word()
        ctx.columnName = chance.word()
        ctx.bodyWithAllProps = randomBodyWith({ ...ctx })
    })
})
