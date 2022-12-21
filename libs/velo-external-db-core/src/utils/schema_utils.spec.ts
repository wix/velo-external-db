import { FieldType as VeloFieldTypeEnum } from '../spi-model/collection'
import { 
    // queriesToWixDataQueryOperators, 
    fieldTypeToWixDataEnum, 
    wixDataEnumToFieldType,
    subtypeToFieldType, 
    // convertWixFormatFieldsToInputFields, 
    // responseFieldToWixFormat, 
    // wixFormatFieldToInputFields 
} from './schema_utils'


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
            expect(fieldTypeToWixDataEnum('datetime')).toBe(VeloFieldTypeEnum.datetime)
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
            expect(wixDataEnumToFieldType(VeloFieldTypeEnum.object)).toBe('object')
        })

        test('datetime type', () => {
            expect(wixDataEnumToFieldType(VeloFieldTypeEnum.datetime)).toBe('datetime')
        })

        test('unsupported type will throw an error', () => {
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
            expect(subtypeToFieldType(VeloFieldTypeEnum.object)).toBe('')
        })

        test('datetime type', () => {
            expect(subtypeToFieldType(VeloFieldTypeEnum.datetime)).toBe('datetime')
        })

        test('unsupported type will throw an error', () => {
            expect(() => wixDataEnumToFieldType(100)).toThrowError()
        })

    })

})
