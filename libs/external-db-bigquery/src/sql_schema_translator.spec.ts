import * as Chance from 'chance'
import { Uninitialized } from '@wix-velo/test-commons'
import SchemaColumnTranslator from './sql_schema_translator'
import { escapeIdentifier as escapeId } from './bigquery_utils'
const chance = Chance()

describe('Sql Schema Column Translator', () => {

    describe('translate velo data schema column to db column', () => {

        describe('numeric fields', () => {

            test('integer', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'number', subtype: 'int' }) ).toEqual({ mode: '', name: escapeId(ctx.fieldName), type: 'INTEGER' })
            })

            test('big integer', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'number', subtype: 'bigint' }) ).toEqual({ mode: '', name: escapeId(ctx.fieldName), type: 'BIGINT' })
            })

            test('decimal float', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'number', subtype: 'float' }) ).toEqual({ mode: '', name: escapeId(ctx.fieldName), type: 'NUMERIC' })
            })

            test('decimal float with precision and maximum scale', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'number', subtype: 'float', precision: '7, 3' }) ).toEqual({ mode: '', name: escapeId(ctx.fieldName), type: 'NUMERIC(7,3)' })
            })

            test('decimal double', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'number', subtype: 'double' }) ).toEqual({ mode: '', name: escapeId(ctx.fieldName), type: 'BIGDECIMAL' })
            })

            test('decimal double with precision and maximum scale', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'number', subtype: 'double', precision: '7, 3' }) ).toEqual({ mode: '', name: escapeId(ctx.fieldName), type: 'BIGDECIMAL(7,3)' })
            })

            test('decimal generic', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'number', subtype: 'decimal' }) ).toEqual({ mode: '', name: escapeId(ctx.fieldName), type: 'NUMERIC' })
            })

            test('decimal generic with precision', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'number', subtype: 'decimal', precision: '7' }) ).toEqual({ mode: '', name: escapeId(ctx.fieldName), type: 'NUMERIC(7)' })
            })

            test('decimal generic with precision and maximum scale', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'number', subtype: 'decimal', precision: '7, 3' }) ).toEqual({ mode: '', name: escapeId(ctx.fieldName), type: 'NUMERIC(7,3)' })
            })

            test('decimal generic with broken precision', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'number', subtype: 'decimal', precision: '-1, 3' }) ).toEqual({ mode: '', name: escapeId(ctx.fieldName), type: 'NUMERIC' })
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'number', subtype: 'decimal', precision: ', 3' }) ).toEqual({ mode: '', name: escapeId(ctx.fieldName), type: 'NUMERIC' })
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'number', subtype: 'decimal', precision: '1, -3' }) ).toEqual({ mode: '', name: escapeId(ctx.fieldName), type: 'NUMERIC' })
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'number', subtype: 'decimal', precision: 'a, -3' }) ).toEqual({ mode: '', name: escapeId(ctx.fieldName), type: 'NUMERIC' })
            })
        })

        describe('date time fields', () => {
            test('date', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'datetime', subtype: 'date' }) ).toEqual({ mode: '', name: escapeId(ctx.fieldName), type: 'TIMESTAMP' })
            })

            test('timestamp', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'datetime', subtype: 'timestamp' }) ).toEqual({ mode: '', name: escapeId(ctx.fieldName), type: 'TIMESTAMP' })
            })

            test('time', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'datetime', subtype: 'time' }) ).toEqual({ mode: '', name: escapeId(ctx.fieldName), type: 'TIME' })
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
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'text', subtype }) ).toEqual({ mode: '', name: escapeId(ctx.fieldName), type: 'STRING' })
              })

            test('string with length', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'text', subtype: 'string', precision: '50' }) ).toEqual({ mode: '', name: escapeId(ctx.fieldName), type: 'STRING(50)' })
            })

            test('string with broken length will return string without length', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'text', subtype: 'string', precision: '-1' }) ).toEqual({ mode: '', name: escapeId(ctx.fieldName), type: 'STRING' })
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'text', subtype: 'string', precision: 'a' }) ).toEqual({ mode: '', name: escapeId(ctx.fieldName), type: 'STRING' })
            })

            test('text small', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'text', subtype: 'small' }) ).toEqual({ mode: '', name: escapeId(ctx.fieldName), type: 'STRING' })
            })

            test('text medium', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'text', subtype: 'medium' }) ).toEqual({ mode: '', name: escapeId(ctx.fieldName), type: 'STRING' })
            })

            test('text large', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'text', subtype: 'large' }) ).toEqual({ mode: '', name: escapeId(ctx.fieldName), type: 'STRING' })
            })

            test('text language', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'text', subtype: 'language' }) ).toEqual({ mode: '', name: escapeId(ctx.fieldName), type: 'STRING' })
            })
        })

        describe('other fields', () => {
            test('boolean', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'boolean' }) ).toEqual({ mode: '', name: escapeId(ctx.fieldName), type: 'BOOL' })
            })
        })

        describe('JSON fields', () => {
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
                expect(env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'object', subtype })).toEqual({ mode: '', name: escapeId(ctx.fieldName), type: 'JSON' })
              })
        })
    })


    describe('translate db type to velo type', () => {
        describe('numeric fields', () => {

            test('integer', () => {
                ['INT64', 'INTEGER'].forEach(t => {
                    expect( env.schemaTranslator.translateType(t) ).toEqual('number')
                })
            })

            test('decimal float', () => {
                ['BIGNUMERIC', 'BIGNUMERIC(5, 5)', 'NUMERIC', 'NUMERIC(5,2)'].forEach(t => {
                    expect( env.schemaTranslator.translateType(t) ).toEqual('number')
                })
            })
        })

        describe('string fields', () => {
            test('string', () => {
                ['STRING', 'STRING(50)'].forEach(t => {
                    expect( env.schemaTranslator.translateType(t) ).toEqual('text')
                })
            })
        })

        describe('date time fields', () => {

            test.each(['DATETIME', 'TIMESTAMP'])('%s', (t) => {
                expect( env.schemaTranslator.translateType(t) ).toEqual('datetime')
            })

            test('time', () => {
                expect( env.schemaTranslator.translateType('TIME') ).toEqual('time')
            })

            test('date', () => {
                 expect( env.schemaTranslator.translateType('DATE') ).toEqual('date')
            })
        })

        describe('other fields', () => {
            test('boolean', () => {
                ['BOOL', 'bit'].forEach(t => {
                    expect( env.schemaTranslator.translateType(t) ).toEqual('boolean')
                })
            })

            test('object', () => {
                expect( env.schemaTranslator.translateType('json') ).toEqual('object')
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
