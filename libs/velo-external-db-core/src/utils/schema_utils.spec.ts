import * as Chance from 'chance'
import { InputField, FieldType } from '@wix-velo/velo-external-db-types'
import { Uninitialized }  from '@wix-velo/test-commons'
import { FieldsWithPrecision, PrimaryKeyFieldName } from '@wix-velo/velo-external-db-commons'
import { FieldType as VeloFieldTypeEnum } from '../spi-model/collection'
import { 
    fieldTypeToWixDataEnum, 
    wixDataEnumToFieldType,
    fieldTypeToSubtype, 
    compareColumnsInDbAndRequest,
    wixFormatFieldToInputFields, 
    fieldKeyToPrecision
} from './schema_utils'
const chance = Chance()


describe('Schema utils functions', () => {
    describe('translate our field type to velo field type emun', () => {
        test('text type', () => {
            expect(fieldTypeToWixDataEnum('text')).toBe(VeloFieldTypeEnum.text)
        })
        test('number type', () => {
            expect(fieldTypeToWixDataEnum('number')).toBe(VeloFieldTypeEnum.number)
        })
        test('boolean type', () => {
            expect(fieldTypeToWixDataEnum('boolean')).toBe(VeloFieldTypeEnum.boolean)
        })
        test('object type', () => {
            expect(fieldTypeToWixDataEnum('object')).toBe(VeloFieldTypeEnum.object)
        })
        test('datetime type', () => {
            expect(fieldTypeToWixDataEnum('datetime')).toBe(VeloFieldTypeEnum.dataTime)
        })
        test('date type', () => {
            expect(fieldTypeToWixDataEnum('date')).toBe(VeloFieldTypeEnum.date)
        })
        test('time type', () => {
            expect(fieldTypeToWixDataEnum('time')).toBe(VeloFieldTypeEnum.time)
        })

        test('unsupported type will throw an error', () => {
            expect(() => fieldTypeToWixDataEnum('unsupported-type')).toThrowError()
        })
    })

    describe('translate velo field type emun to our field type', () => {
        test.each([
            [VeloFieldTypeEnum.text, FieldType.text],
            [VeloFieldTypeEnum.url, FieldType.text],
            [VeloFieldTypeEnum.richText, FieldType.text],
            [VeloFieldTypeEnum.number, FieldType.number], 
            [VeloFieldTypeEnum.date, FieldType.datetime],
            [VeloFieldTypeEnum.dataTime, FieldType.datetime],
            [VeloFieldTypeEnum.time, FieldType.datetime],
            [VeloFieldTypeEnum.boolean, FieldType.boolean],
            [VeloFieldTypeEnum.image, FieldType.text],
            [VeloFieldTypeEnum.document, FieldType.text],
            [VeloFieldTypeEnum.video, FieldType.text],
            [VeloFieldTypeEnum.any, FieldType.object],
            [VeloFieldTypeEnum.arrayString, FieldType.object],
            [VeloFieldTypeEnum.arrayDocument, FieldType.object],
            [VeloFieldTypeEnum.audio, FieldType.text],
            [VeloFieldTypeEnum.language, FieldType.text],
            [VeloFieldTypeEnum.richContent, FieldType.object],
            [VeloFieldTypeEnum.mediaGallery, FieldType.object],
            [VeloFieldTypeEnum.address, FieldType.object],
            [VeloFieldTypeEnum.pageLink, FieldType.object],
            [VeloFieldTypeEnum.reference, FieldType.object],
            [VeloFieldTypeEnum.object, FieldType.object],
            [VeloFieldTypeEnum.array, FieldType.object],
          ])('%s type', (veloType, domainType) => {
            expect(wixDataEnumToFieldType(veloType)).toBe(domainType)
          })

        test('unsupported type will throw an error', () => {
            // @ts-ignore
            expect(() => wixDataEnumToFieldType(100)).toThrowError()
        })
    })

    describe('translate velo field type enum to our sub type', () => {
        test.each([
            [VeloFieldTypeEnum.text, 'string'],
            [VeloFieldTypeEnum.url, 'string'],
            [VeloFieldTypeEnum.richText, 'string'],
            [VeloFieldTypeEnum.number, 'float'],
            [VeloFieldTypeEnum.date, 'date'],
            [VeloFieldTypeEnum.dataTime, 'datetime'],
            [VeloFieldTypeEnum.time, 'time'],
            [VeloFieldTypeEnum.boolean, 'boolean'],
            [VeloFieldTypeEnum.image, 'image'],
            [VeloFieldTypeEnum.document, 'document'],
            [VeloFieldTypeEnum.video, 'video'],
            [VeloFieldTypeEnum.any, 'any'],
            [VeloFieldTypeEnum.arrayString, 'arrayString'],
            [VeloFieldTypeEnum.arrayDocument, 'arrayDocument'],
            [VeloFieldTypeEnum.audio, 'audio'],
            [VeloFieldTypeEnum.language, 'language'],
            [VeloFieldTypeEnum.richContent, 'richContent'],
            [VeloFieldTypeEnum.mediaGallery, 'mediaGallery'],
            [VeloFieldTypeEnum.address, 'address'],
            [VeloFieldTypeEnum.pageLink, 'pageLink'],
            [VeloFieldTypeEnum.reference, 'reference'],
            [VeloFieldTypeEnum.object, 'object'],
            [VeloFieldTypeEnum.array, 'array'],
          ])('%s type', (veloType, domainSubType) => {
            expect(fieldTypeToSubtype(veloType)).toBe(domainSubType)
          })
        test('unsupported type will throw an error', () => {
            // @ts-ignore
            expect(() => wixDataEnumToFieldType(100)).toThrowError()
        })
    })

    describe('Precision for columns', () => {
        test.each(FieldsWithPrecision)('%s column should have a precision of 255', (columnName,) => {
            expect(fieldKeyToPrecision(columnName)).toEqual(255)
        })
        test('other column should not have a precision', () => { expect(fieldKeyToPrecision(ctx.column.name)).toBeUndefined() })
    })

    describe('convert wix format fields to our fields', () => {
        test('convert velo format fields to our fields', () => {
            expect(wixFormatFieldToInputFields({ key: ctx.columnName, type: fieldTypeToWixDataEnum('text') })).toEqual({
                name: ctx.columnName,
                type: 'text',
                subtype: 'string',
                precision: undefined,
                isPrimary: false,
            })
        })
        test.each(FieldsWithPrecision)('convert %s field in velo format to our fields with precision property', (columnName) => {
            expect(wixFormatFieldToInputFields({ key: columnName, type: fieldTypeToWixDataEnum('text') })).toEqual({
                name: columnName,
                type: 'text',
                subtype: 'string',
                precision: 255,
                isPrimary: columnName === PrimaryKeyFieldName ? true : false,
            })
        })
    })

    describe('convert encrypted fields to object', () => {
        test('convert encrypted fields to object', () => {
            expect(wixFormatFieldToInputFields({ key: ctx.columnName, type: fieldTypeToWixDataEnum('text'), encrypted: true })).toEqual({
                name: ctx.columnName,
                type: 'object'
            })
        })
    })

    describe('compare columns in db and request function', () => {
        test('compareColumnsInDbAndRequest function - add columns', async() => {
            const columnsInDb = [{
                field: ctx.column.name,
                type: ctx.column.type
            }]
            const columnsInRequest = [{
                key: ctx.column.name,
                type: fieldTypeToWixDataEnum(ctx.column.type),
            }]  
            const newColumn = {
                key: ctx.anotherColumn.name,
                type: fieldTypeToWixDataEnum(ctx.anotherColumn.type)
            }
            expect(compareColumnsInDbAndRequest([], []).columnsToAdd).toEqual([])
            expect(compareColumnsInDbAndRequest(columnsInDb, columnsInRequest).columnsToAdd).toEqual([])
            expect(compareColumnsInDbAndRequest(columnsInDb, []).columnsToAdd).toEqual([])
            expect(compareColumnsInDbAndRequest([], columnsInRequest).columnsToAdd).toEqual(columnsInRequest.map(wixFormatFieldToInputFields))
            expect(compareColumnsInDbAndRequest(columnsInDb, [...columnsInRequest, newColumn]).columnsToAdd).toEqual([newColumn].map(wixFormatFieldToInputFields))
        })

        test('compareColumnsInDbAndRequest function - remove columns', async() => {
            const columnsInDb = [{
                field: ctx.column.name,
                type: ctx.column.type
            }]
            const columnsInRequest = [{
                key: ctx.column.name,
                type: fieldTypeToWixDataEnum(ctx.column.type),
            }]
            const newColumn = {
                key: ctx.anotherColumn.name,
                type: fieldTypeToWixDataEnum(ctx.anotherColumn.type)
            }
            expect(compareColumnsInDbAndRequest([], []).columnsToRemove).toEqual([])
            expect(compareColumnsInDbAndRequest(columnsInDb, columnsInRequest).columnsToRemove).toEqual([])
            expect(compareColumnsInDbAndRequest(columnsInDb, [...columnsInRequest, newColumn]).columnsToRemove).toEqual([])
            expect(compareColumnsInDbAndRequest(columnsInDb, []).columnsToRemove).toEqual(columnsInDb.map(f => f.field))
            expect(compareColumnsInDbAndRequest(columnsInDb, [newColumn]).columnsToRemove).toEqual(columnsInDb.map(f => f.field))
        })

        test('compareColumnsInDbAndRequest function - change column type', async() => {
            const columnsInDb = [{
                field: ctx.column.name,
                type: 'text'
            }]

            const columnsInRequest = [{
                key: ctx.column.name,
                type: fieldTypeToWixDataEnum('text'),
            }]

            const changedColumnType = {
                key: ctx.column.name,
                type: fieldTypeToWixDataEnum('number')
            }

            expect(compareColumnsInDbAndRequest([], []).columnsToChangeType).toEqual([])
            expect(compareColumnsInDbAndRequest(columnsInDb, columnsInRequest).columnsToChangeType).toEqual([])
            expect(compareColumnsInDbAndRequest(columnsInDb, [changedColumnType]).columnsToChangeType).toEqual([changedColumnType].map(wixFormatFieldToInputFields))
        })
    })

    interface Ctx {
        collectionName: string,
        columnName: string,
        column: InputField,
        anotherColumn: InputField,
    }

    const ctx: Ctx = {
        collectionName: Uninitialized,
        columnName: Uninitialized,
        column: Uninitialized,
        anotherColumn: Uninitialized,
    }

    beforeEach(() => {
        ctx.collectionName = chance.word({ length: 5 })
        ctx.columnName = chance.word({ length: 5 })
        ctx.column = ({ name: chance.word(), type: 'text', subtype: 'string', precision: '256', isPrimary: false })
        ctx.anotherColumn = ({ name: chance.word(), type: 'text', subtype: 'string', precision: '256', isPrimary: false })
    })

})
