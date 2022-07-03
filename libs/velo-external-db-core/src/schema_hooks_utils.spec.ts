import each from 'jest-each'
import * as Chance from 'chance'
import { Uninitialized } from '@wix-velo/test-commons'
import { randomBodyWith } from '../test/gen'
import { SchemaHooksForAction, SchemaOperations, schemaPayloadFor, SchemaActions } from './schema_hooks_utils'
const chance = Chance()

describe('Hooks Utils', () => {
    describe('Hooks For Action', () => {
        describe('Before Read', () => {
            each([SchemaActions.BeforeList, SchemaActions.BeforeListHeaders, SchemaActions.BeforeFind])
                .test('Hooks action for %s should return appropriate array', (action) => {
                    expect(SchemaHooksForAction[action]).toEqual(['beforeAll', 'beforeRead', action])
                })
        })
        describe('After Read', () => {
            each([SchemaActions.AfterList, SchemaActions.AfterListHeaders, SchemaActions.AfterFind])
                .test('Hooks action for %s should return appropriate array', (action) => {
                    expect(SchemaHooksForAction[action]).toEqual(['afterAll', 'afterRead', action])
                })
        })
        describe('Before Write', () => {
            each([SchemaActions.BeforeCreate, SchemaActions.BeforeColumnAdd, SchemaActions.BeforeColumnRemove])
                .test('Hooks action for %s should return appropriate array', (action) => {
                    expect(SchemaHooksForAction[action]).toEqual(['beforeAll', 'beforeWrite', action])
                })
        })
        describe('After Write', () => {
            each([SchemaActions.AfterCreate, SchemaActions.AfterColumnAdd, SchemaActions.AfterColumnRemove])
                .test('Hooks action for %s should return appropriate array', (action) => {
                    expect(SchemaHooksForAction[action]).toEqual(['afterAll', 'afterWrite', action])
                })
        })
    })

    describe('Payload For', () => {
        each([SchemaOperations.List, SchemaOperations.ListHeaders])
            .test('Payload for %s should return null', (operation) => {
                expect(schemaPayloadFor(operation, randomBodyWith({}))).toEqual({})
            })
        test('Payload for Find should return schemaIds', () => {
            expect(schemaPayloadFor(SchemaOperations.Find, randomBodyWith({ schemaIds: ctx.schemaIds }))).toEqual({ schemaIds: ctx.schemaIds })
        })
        test('Payload for Create should return collectionName', () => {
            expect(schemaPayloadFor(SchemaOperations.Create, randomBodyWith({ collectionName: ctx.collectionName }))).toEqual({ collectionName: ctx.collectionName })
        })
        test('Payload for ColumnAdd should return column', () => {
            expect(schemaPayloadFor(SchemaOperations.ColumnAdd, randomBodyWith({ column: ctx.column }))).toEqual({ column: ctx.column })
        })
        test('Payload for ColumnRemove should return columnName', () => {
            expect(schemaPayloadFor(SchemaOperations.ColumnRemove, randomBodyWith({ columnName: ctx.columnName }))).toEqual({ columnName: ctx.columnName })
        })
    })


    const ctx = {
        schemaIds: Uninitialized,
        collectionName: Uninitialized,
        column: Uninitialized,
        columnName: Uninitialized
    }

    beforeEach(() => {
        ctx.schemaIds = chance.n(chance.word, chance.integer({ min: 1, max: 10 }))
        ctx.collectionName = chance.word()
        ctx.column = chance.word()
        ctx.columnName = chance.word()
    })
})