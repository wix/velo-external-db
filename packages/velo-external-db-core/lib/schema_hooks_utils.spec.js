const each = require('jest-each').default
const Chance = require('chance')
const chance = Chance()
const { Uninitialized } = require('test-commons')
const { givenBodyWith } = require('../../velo-external-db/test/drivers/hooks_test_support')
const { hooksForAction, Operations, payloadFor, Actions } = require('./schema_hooks_utils')

describe('Hooks Utils', () => {
    describe('Hooks For Action', () => {
        describe('Before Read', () => {
            each([Actions.BeforeList, Actions.BeforeListHeaders, Actions.BeforeFind])
                .test('Hooks action for %s should return appropriate array', (action) => {
                    expect(hooksForAction(action)).toEqual(['beforeAll', 'beforeRead', action])
                })
        })
        describe('After Read', () => {
            each([Actions.AfterList, Actions.AfterListHeaders, Actions.AfterFind])
                .test('Hooks action for %s should return appropriate array', (action) => {
                    expect(hooksForAction(action)).toEqual(['afterAll', 'afterRead', action])
                })
        })
        describe('Before Write', () => {
            each([Actions.BeforeCreate, Actions.BeforeColumnAdd, Actions.BeforeColumnRemove])
                .test('Hooks action for %s should return appropriate array', (action) => {
                    expect(hooksForAction(action)).toEqual(['beforeAll', 'beforeWrite', action])
                })
        })
        describe('After Write', () => {
            each([Actions.AfterCreate, Actions.AfterColumnAdd, Actions.AfterColumnRemove])
                .test('Hooks action for %s should return appropriate array', (action) => {
                    expect(hooksForAction(action)).toEqual(['afterAll', 'afterWrite', action])
                })
        })
    })

    describe('Payload For', () => {
        each([Operations.List, Operations.ListHeaders])
            .test('Payload for %s should return null', (operation) => {
                expect(payloadFor(operation, givenBodyWith({}))).toEqual(null)
            })
        test('Payload for Find should return schemaIds', () => {
            expect(payloadFor(Operations.Find, givenBodyWith({ schemaIds: ctx.schemaIds }))).toEqual(ctx.schemaIds)
        })
        test('Payload for Create should return collectionName', () => {
            expect(payloadFor(Operations.Create, givenBodyWith({ collectionName: ctx.collectionName }))).toEqual(ctx.collectionName)
        })
        test('Payload for ColumnAdd should return column', () => {
            expect(payloadFor(Operations.ColumnAdd, givenBodyWith({ column: ctx.column }))).toEqual(ctx.column)
        })
        test('Payload for ColumnRemove should return columnName', () => {
            expect(payloadFor(Operations.ColumnRemove, givenBodyWith({ columnName: ctx.columnName }))).toEqual(ctx.columnName)
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