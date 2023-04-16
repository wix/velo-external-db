import * as Chance from 'chance'
import { InputField } from '@wix-velo/velo-external-db-types'
import { Uninitialized } from '@wix-velo/test-commons'
import { FieldType as VeloFieldTypeEnum } from '../spi-model/collection'
import { 
    fieldTypeToWixDataEnum, 
    wixDataEnumToFieldType,
    subtypeToFieldType, 
    compareColumnsInDbAndRequest,
    wixFormatFieldToInputFields 
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
            expect(fieldTypeToWixDataEnum('object')).toBe(VeloFieldTypeEnum.json)
        })
        test('datetime type', () => {
            expect(fieldTypeToWixDataEnum('datetime')).toBe(VeloFieldTypeEnum.timestamp)
        })

        test('unsupported type will throw an error', () => {
            expect(() => fieldTypeToWixDataEnum('unsupported-type')).toThrowError()
        })
    })

    describe('translate velo field type emun to our field type', () => {
        test('text type', () => {
            expect(wixDataEnumToFieldType(VeloFieldTypeEnum.text)).toBe('text')
        })
        test('number type', () => {
            expect(wixDataEnumToFieldType(VeloFieldTypeEnum.number)).toBe('number')
        })
        test('boolean type', () => {
            expect(wixDataEnumToFieldType(VeloFieldTypeEnum.boolean)).toBe('boolean')
        })
        test('object type', () => {
            expect(wixDataEnumToFieldType(VeloFieldTypeEnum.json)).toBe('object')
        })

        test('datetime type', () => {
            expect(wixDataEnumToFieldType(VeloFieldTypeEnum.timestamp)).toBe('datetime')
        })

        test('unsupported type will throw an error', () => {
            // @ts-ignore
            expect(() => wixDataEnumToFieldType(100)).toThrowError()
        })
    })

    describe('translate velo field type enum to our sub type', () => {
        test('text type', () => {
            expect(subtypeToFieldType(VeloFieldTypeEnum.text)).toBe('string')
        })
        test('number type', () => {
            expect(subtypeToFieldType(VeloFieldTypeEnum.number)).toBe('float')
        })
        test('boolean type', () => {
            expect(subtypeToFieldType(VeloFieldTypeEnum.boolean)).toBe('')
        })
        test('object type', () => {
            expect(subtypeToFieldType(VeloFieldTypeEnum.json)).toBe('')
        })

        test('datetime type', () => {
            expect(subtypeToFieldType(VeloFieldTypeEnum.timestamp)).toBe('datetime')
        })

        test('unsupported type will throw an error', () => {
            // @ts-ignore
            expect(() => wixDataEnumToFieldType(100)).toThrowError()
        })
    })

    describe('convert wix format fields to our fields', () => {
        test('convert velo format fields to our fields', () => {
            expect(wixFormatFieldToInputFields({ key: ctx.columnName, type: fieldTypeToWixDataEnum('text') })).toEqual({
                name: ctx.columnName,
                type: 'text',
                subtype: 'string',
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
