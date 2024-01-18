import SchemaColumnTranslator from './sql_schema_translator'
import { Uninitialized } from '@wix-velo/test-commons'
import * as Chance from 'chance'
import { escapeId } from './spanner_utils'
const chance = Chance()

describe('Sql Schema Column Translator', () => {

    describe('translate velo data schema column to db column', () => {

        describe('numeric fields', () => {

            test('integer', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'number', subtype: 'int' }) ).toEqual(`${escapeId(ctx.fieldName)} INT64`)
            })

            test('big integer', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'number', subtype: 'bigint' }) ).toEqual(`${escapeId(ctx.fieldName)} INT64`)
            })

            test('decimal float', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'number', subtype: 'float' }) ).toEqual(`${escapeId(ctx.fieldName)} FLOAT64`)
            })

            test('decimal double', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'number', subtype: 'double' }) ).toEqual(`${escapeId(ctx.fieldName)} NUMERIC`)
            })

            test('decimal generic', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'number', subtype: 'decimal' }) ).toEqual(`${escapeId(ctx.fieldName)} FLOAT64`)
            })
        })

        describe('date time fields', () => {
            test('date', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'datetime', subtype: 'date' }) ).toEqual(`${escapeId(ctx.fieldName)} DATE`)
            })

            test('datetime', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'datetime', subtype: 'datetime' }) ).toEqual(`${escapeId(ctx.fieldName)} TIMESTAMP`)
            })

            test('timestamp', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'datetime', subtype: 'timestamp' }) ).toEqual(`${escapeId(ctx.fieldName)} TIMESTAMP`)
            })

            test('time', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'datetime', subtype: 'time' }) ).toEqual(`${escapeId(ctx.fieldName)} TIMESTAMP`)
            })

            test('year', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'datetime', subtype: 'year' }) ).toEqual(`${escapeId(ctx.fieldName)} DATE`)
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
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'text', subtype }) ).toEqual(`${escapeId(ctx.fieldName)} STRING(2048)`)
              })

            test('string with length', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'text', subtype: 'string', precision: '2055' }) ).toEqual(`${escapeId(ctx.fieldName)} STRING(2055)`)
            })

            test('text small', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'text', subtype: 'small' }) ).toEqual(`${escapeId(ctx.fieldName)} STRING(256)`)
            })

            test('text medium', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'text', subtype: 'medium' }) ).toEqual(`${escapeId(ctx.fieldName)} STRING(65536)`)
            })

            test('text large', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'text', subtype: 'large' }) ).toEqual(`${escapeId(ctx.fieldName)} STRING(4294967296)`)
            })

            test('text language', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'text', subtype: 'language' }) ).toEqual(`${escapeId(ctx.fieldName)} STRING(2048)`)
            })  
        })

        describe('other fields', () => {
            test('boolean', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'boolean' }) ).toEqual(`${escapeId(ctx.fieldName)} BOOL`)
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
                expect(env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'object', subtype })).toEqual(`${escapeId(ctx.fieldName)} JSON`)
              })
        })
    })


    describe('translate db type to velo type', () => {
        describe('numeric fields', () => {

            test('integer', () => {
                ['INT64'].forEach(t => {
                    expect( env.schemaTranslator.translateType(t) ).toEqual({ type: 'number', subtype: 'int' })
                })
            })
            test('decimal', () => {
                ['NUMERIC'].forEach(t => {
                    expect( env.schemaTranslator.translateType(t) ).toEqual({ type: 'number', subtype: 'double' })
                })
            })
            test('decimal float', () => {
                ['FLOAT64'].forEach(t => {
                    expect( env.schemaTranslator.translateType(t) ).toEqual({ type: 'number', subtype: 'float' })
                })
            })
        })

        describe('string fields', () => {
            test('string', () => {
                ['STRING', 'STRING(2048)'].forEach(t => {
                    expect( env.schemaTranslator.translateType(t) ).toEqual({ type: 'text', subtype: 'string' })
                })
            })
        })

        describe('date time fields', () => {
            test('datetime date', () => {
                ['DATE'].forEach(t => {
                    expect( env.schemaTranslator.translateType(t) ).toEqual({ type: 'datetime', subtype: 'date' })
                })
            })
            test('datetime timestamp', () => {
                ['TIMESTAMP'].forEach(t => {
                    expect( env.schemaTranslator.translateType(t) ).toEqual({ type: 'datetime', subtype: 'timestamp' })
                })
            })
        })

        describe('object fields', () => {
            test('obejct', () => {
                expect( env.schemaTranslator.translateType('json') ).toEqual({ type: 'object' })
            })
        })

        describe('other fields', () => {
            test('boolean', () => {
                ['BOOL', 'bit'].forEach(t => {
                    expect( env.schemaTranslator.translateType(t) ).toEqual({ type: 'boolean' })
                })
            })
            
            test('unknown type should return text', () => { 
                expect( env.schemaTranslator.translateType('unknown') ).toEqual({ type: 'text' })
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
