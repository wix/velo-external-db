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


        })

        describe('string fields', () => {
            test.each([
                'string',
                'image',
                'video',
                'audio',
                'document',
                'language',
            ])('%s', (subtype) => {
                expect(env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'text', subtype })).toEqual(`${escapeIdentifier(ctx.fieldName)} text`)
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
            test.each([
                'object',
                'any',
                'mediaGallery',
                'address',
                'pageLink',
                'reference',
                'multiReference',
                'arrayDocument',
                'arrayString',
                'richcontent',
              ])('%s', (subtype) => {
                expect(env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'object', subtype })).toEqual(`${escapeIdentifier(ctx.fieldName)} json`)
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
                expect( env.schemaTranslator.translateType('date') ).toEqual('date')
            })
            test('time', () => {
                expect( env.schemaTranslator.translateType('time') ).toEqual('time')
            })
            test('datetime', () => {
                ['timez', 'timestamp', 'timestamptz'].forEach(t => {
                    expect( env.schemaTranslator.translateType(t) ).toEqual('datetime')
                })
            })
        })

        describe('json fields', () => {
            test('object', () => {
                expect( env.schemaTranslator.translateType('json') ).toEqual('object')
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
