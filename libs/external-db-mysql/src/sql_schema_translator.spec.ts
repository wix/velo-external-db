import SchemaColumnTranslator from './sql_schema_translator'
import { Uninitialized } from '@wix-velo/test-commons'
import * as Chance from 'chance'
import { escapeId } from './mysql_utils'
const chance = Chance()

describe('Sql Schema Column Translator', () => {

    describe('translate velo data schema column to db column', () => {

        describe('numeric fields', () => {

            test('integer', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'number', subtype: 'int' }) ).toEqual(`${escapeId(ctx.fieldName)} INT`)
            })

            test('big integer', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'number', subtype: 'bigint' }) ).toEqual(`${escapeId(ctx.fieldName)} BIGINT`)
            })

            test('decimal float', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'number', subtype: 'float' }) ).toEqual(`${escapeId(ctx.fieldName)} FLOAT(15,2)`)
            })

            test('decimal float with precision', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'number', subtype: 'float', precision: '7, 3' }) ).toEqual(`${escapeId(ctx.fieldName)} FLOAT(7,3)`)
            })

            test('decimal double', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'number', subtype: 'double' }) ).toEqual(`${escapeId(ctx.fieldName)} DOUBLE(15,2)`)
            })

            test('decimal double with precision', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'number', subtype: 'double', precision: '7, 3' }) ).toEqual(`${escapeId(ctx.fieldName)} DOUBLE(7,3)`)
            })

            test('decimal generic', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'number', subtype: 'decimal' }) ).toEqual(`${escapeId(ctx.fieldName)} DECIMAL(15,2)`)
            })

            test('decimal generic with precision', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'number', subtype: 'decimal', precision: '7, 3' }) ).toEqual(`${escapeId(ctx.fieldName)} DECIMAL(7,3)`)
            })
        })

        describe('date time fields', () => {
            test('date', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'datetime', subtype: 'date' }) ).toEqual(`${escapeId(ctx.fieldName)} DATE`)
            })

            test('datetime', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'datetime', subtype: 'datetime' }) ).toEqual(`${escapeId(ctx.fieldName)} DATETIME`)
            })

            test('timestamp', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'datetime', subtype: 'timestamp' }) ).toEqual(`${escapeId(ctx.fieldName)} TIMESTAMP DEFAULT CURRENT_TIMESTAMP`)
            })

            test('time', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'datetime', subtype: 'time' }) ).toEqual(`${escapeId(ctx.fieldName)} TIME`)
            })

            test('year', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'datetime', subtype: 'year' }) ).toEqual(`${escapeId(ctx.fieldName)} YEAR`)
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
                expect(env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'text', subtype })).toEqual(`${escapeId(ctx.fieldName)} TEXT`)
              })

            test('string with length', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'text', subtype: 'string', precision: '2055' }) ).toEqual(`${escapeId(ctx.fieldName)} VARCHAR(2055)`)
            })

            test('text small', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'text', subtype: 'small' }) ).toEqual(`${escapeId(ctx.fieldName)} TEXT`)
            })

            test('text medium', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'text', subtype: 'medium' }) ).toEqual(`${escapeId(ctx.fieldName)} MEDIUMTEXT`)
            })

            test('text large', () => {
                expect( env.schemaTranslator.columnToDbColumnSql({ name: ctx.fieldName, type: 'text', subtype: 'large' }) ).toEqual(`${escapeId(ctx.fieldName)} LONGTEXT`)
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
                ['INT', 'INTEGER', 'INTEGER(10)', 'BIGINT', 'SMALLINT'].forEach(t => {
                    expect( env.schemaTranslator.translateType(t) ).toEqual('number')
                })
            })

            test('decimal float', () => {
                ['FLOAT', 'FLOAT(5,2)', 'DOUBLE', 'DOUBLE(5,2)', 'DECIMAL', 'DECIMAL(5,2)'].forEach(t => {
                    expect( env.schemaTranslator.translateType(t) ).toEqual('number')
                })
            })
        })

        describe('string fields', () => {
            test('string', () => {
                ['VARCHAR', 'VARCHAR(2048)', 'TEXT', 'MEDIUMTEXT', 'LONGTEXT'].forEach(t => {
                    expect( env.schemaTranslator.translateType(t) ).toEqual('text')
                })
            })
        })

        describe('date time fields', () => {
            test.each([ 'DATETIME', 'TIMESTAMP' ])('%s', (t) => {
                expect( env.schemaTranslator.translateType(t) ).toEqual('datetime')
            })


            test('time', () => {
                expect( env.schemaTranslator.translateType('TIME') ).toEqual('time')
            })

            test('date', () => {
                expect( env.schemaTranslator.translateType('DATE') ).toEqual('date')
           })
        })

        describe('json fields', () => {
            test('object', () => {
                expect( env.schemaTranslator.translateType('json') ).toEqual('object')
            })
        })

        describe('other fields', () => {
            test('boolean', () => {
                ['tinyint', 'bit'].forEach(t => {
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
