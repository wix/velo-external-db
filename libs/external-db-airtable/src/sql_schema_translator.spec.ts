import SchemaColumnTranslator from './sql_schema_translator'
import { Uninitialized } from '@wix-velo/test-commons'
import Chance = require('chance')
const chance = Chance()

describe('Sql Schema Column Translator', () => {

    describe('translate db type to velo type', () => {
        describe('numeric fields', () => {

            test('integer', () => {
                ['Autonumber', 'Count', 'Duration', 'Number', 'Rating', 'Percent'].forEach(t => {
                    expect( env.schemaTranslator.translateType(t) ).toEqual('number')
                })
            })

            test('decimal float', () => {
                ['Currency'].forEach(t => {
                    expect( env.schemaTranslator.translateType(t) ).toEqual('number')
                })
            })
        })

        describe('string fields', () => {
            test('string', () => {
                ['Email', 'Longtext', 'Phonenumber', 'Rollup', 'Singlelinetext', 'Singleselect', 'URL',
                 'multilinetext', 'linkedrecord', 'multiplerecordlinks', 'multipleattachment'].forEach(t => {
                    expect( env.schemaTranslator.translateType(t) ).toEqual('text')
                })
            })
        })

        describe('date time fields', () => {
            test('date', () => {
                ['Createdtime', 'Date', 'datetime'].forEach(t => {
                    expect( env.schemaTranslator.translateType(t) ).toEqual('datetime')
                })
            })
        })

        describe('other fields', () => {
            test('boolean', () => {
                ['Checkbox'].forEach(t => {
                    expect( env.schemaTranslator.translateType(t) ).toEqual('boolean')
                })
            })
        })
    })

    interface Context {
        fieldName: string | null
    }

    const ctx: Context = {
        fieldName: Uninitialized,
    }

    interface Enviorment {
        schemaTranslator: any
    }

    const env: Enviorment = {
        schemaTranslator: Uninitialized,
    }

    beforeEach(() => {
        ctx.fieldName = chance.word()
    })

    beforeAll(function() {
        env.schemaTranslator = new SchemaColumnTranslator()
    })
})
