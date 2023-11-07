/* eslint-disable jest/no-commented-out-tests */
import * as Chance from 'chance'
import { Uninitialized } from '@wix-velo/test-commons'
import SchemaColumnTranslator from './sql_schema_translator'
import { escapeIdentifier } from './postgres_utils'
const chance = Chance()

describe('Sql Schema Column Translator', () => {

    describe('translate velo data schema column to db column', () => {

        describe('numeric fields', () => {

            test('integer', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'number', subtype: 'int' }) ).toEqual(`${escapeIdentifier(ctx.fieldName)} integer`)
            })

            test('big integer', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'number', subtype: 'bigint' }) ).toEqual(`${escapeIdentifier(ctx.fieldName)} bigint`)
            })

            test('decimal float', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'number', subtype: 'float' }) ).toEqual(`${escapeIdentifier(ctx.fieldName)} decimal`)
            })

            test('decimal double', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'number', subtype: 'double' }) ).toEqual(`${escapeIdentifier(ctx.fieldName)} double precision`)
            })

            test('decimal generic', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'number', subtype: 'decimal' }) ).toEqual(`${escapeIdentifier(ctx.fieldName)} real`)
            })
        })

        describe('date time fields', () => {
            test('date', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'datetime', subtype: 'date' }) ).toEqual(`${escapeIdentifier(ctx.fieldName)} date`)
            })

            test('datetime', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'datetime', subtype: 'datetime' }) ).toEqual(`${escapeIdentifier(ctx.fieldName)} timestamp`)
            })

            test('timestamp', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'datetime', subtype: 'timestamp' }) ).toEqual(`${escapeIdentifier(ctx.fieldName)} timestamp`)
            })

            test('time', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'datetime', subtype: 'time' }) ).toEqual(`${escapeIdentifier(ctx.fieldName)} time`)
            })

            // test('year', () => {
            //     expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'datetime', subtype: 'year' }) ).toEqual(`${escapeIdentifier(ctx.fieldName)} YEAR`)
            // })

        })

        describe('string fields', () => {
            test('string', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'text', subtype: 'string' }) ).toEqual(`${escapeIdentifier(ctx.fieldName)} varchar(2048)`)
            })

            test('string with length', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'text', subtype: 'string', precision: '2055' }) ).toEqual(`${escapeIdentifier(ctx.fieldName)} varchar(2055)`)
            })

            test('text small', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'text', subtype: 'small' }) ).toEqual(`${escapeIdentifier(ctx.fieldName)} text`)
            })

            test('text medium', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'text', subtype: 'medium' }) ).toEqual(`${escapeIdentifier(ctx.fieldName)} text`)
            })

            test('text large', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'text', subtype: 'large' }) ).toEqual(`${escapeIdentifier(ctx.fieldName)} text`)
            })

            test('text language', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'text', subtype: 'language' }) ).toEqual(`${escapeIdentifier(ctx.fieldName)} text`)
            })
        })

        describe('other fields', () => {
            test('boolean', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'boolean' }) ).toEqual(`${escapeIdentifier(ctx.fieldName)} boolean`)
            })
        })

        describe('json fields', () => {
            test('obect', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'object', subtype: 'object' }) ).toEqual(`${escapeIdentifier(ctx.fieldName)} json`)
            })

            test('image', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'object', subtype: 'image' }) ).toEqual(`${escapeIdentifier(ctx.fieldName)} json`)
            })

            test('document', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'object', subtype: 'image' }) ).toEqual(`${escapeIdentifier(ctx.fieldName)} json`)
            })

            test('video', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'object', subtype: 'video' }) ).toEqual(`${escapeIdentifier(ctx.fieldName)} json`)
            })

            test('audio', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'object', subtype: 'audio' }) ).toEqual(`${escapeIdentifier(ctx.fieldName)} json`)
            })

            test('any', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'object', subtype: 'any' }) ).toEqual(`${escapeIdentifier(ctx.fieldName)} json`)
            })

            test('mediaGallery', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'object', subtype: 'mediaGallery' }) ).toEqual(`${escapeIdentifier(ctx.fieldName)} json`)
            })

            test('address', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'object', subtype: 'address' }) ).toEqual(`${escapeIdentifier(ctx.fieldName)} json`)
            })

            test('pageLink', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'object', subtype: 'pageLink' }) ).toEqual(`${escapeIdentifier(ctx.fieldName)} json`)
            })

            test('reference', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'object', subtype: 'reference' }) ).toEqual(`${escapeIdentifier(ctx.fieldName)} json`)
            })

            test('multiReference', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'object', subtype: 'multiReference' }) ).toEqual(`${escapeIdentifier(ctx.fieldName)} json`)
            })

            test('arrayString', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'object', subtype: 'arrayString' }) ).toEqual(`${escapeIdentifier(ctx.fieldName)} json`)
            })

            test('arrayDocument', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'object', subtype: 'document' }) ).toEqual(`${escapeIdentifier(ctx.fieldName)} json`)
            })

            test('richContent', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'object', subtype: 'richContent' }) ).toEqual(`${escapeIdentifier(ctx.fieldName)} json`)
            })
        })
    })


    describe('translate db type to velo type', () => {
        describe('numeric fields', () => {
            test('integer', () => {
                ['int', 'int2', 'int4', 'int8', 'smallint', 'integer', 'bigint', 'serial', 'smallserial', 'bigserial'].forEach(t => {
                    expect( env.schemaTranslator.translateType(t) ).toEqual('number')
                })
            })

            test('decimal float', () => {
                ['decimal', 'numeric', 'real', 'double precision', 'float4', 'float8', 'money'].forEach(t => {
                    expect( env.schemaTranslator.translateType(t) ).toEqual('number')
                })
            })
        })

        describe('string fields', () => {

            test('character', () => {
                ['character', 'character varying', 'varchar', 'char', 'text'].forEach(t => {
                    expect( env.schemaTranslator.translateType(t) ).toEqual('text')
                })
            })
        })

        describe('date time fields', () => {
            test('date', () => {
                ['date', 'time', 'timez', 'timestamp', 'timestamptz'].forEach(t => {
                    expect( env.schemaTranslator.translateType(t) ).toEqual('datetime')
                })
            })
        })

        describe('json fields', () => {
            test('object', () => {
                ['json'].forEach(t => {
                    expect( env.schemaTranslator.translateType(t) ).toEqual('object')
                })
            })
        })

        describe('other fields', () => {
            test('boolean', () => {
                ['boolean', 'bit'].forEach(t => {
                    expect( env.schemaTranslator.translateType(t) ).toEqual('boolean')
                })
            })

            test('unknown type should return text', () => { 
                expect( env.schemaTranslator.translateType('unknown') ).toEqual('text')
            })
        })
    })



    const ctx = {
        fieldName: Uninitialized,
    }

    const env = {
        schemaTranslator: Uninitialized,
    }

    beforeEach(() => {
        ctx.fieldName = chance.word()
    })

    beforeAll(function() {
        env.schemaTranslator = new SchemaColumnTranslator()
    })
})
