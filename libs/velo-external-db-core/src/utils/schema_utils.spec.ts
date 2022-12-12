import { FieldType as VeloFieldTypeEnum } from '../spi-model/collection'
import { 
    // convertQueriesToQueryOperatorsEnum, 
    convertFieldTypeToEnum, 
    convertEnumToFieldType,
    subtypeToFieldType, 
    // convertWixFormatFieldsToInputFields, 
    // convertResponseFieldToWixFormat, 
    // convertWixFormatFieldToInputFields 
} from './schema_utils'


describe('Schema utils functions', () => {
    describe('translate our field type to velo field type emun', () => {
        test('text type', () => {
            expect(convertFieldTypeToEnum('text')).toBe(VeloFieldTypeEnum.text)
        })
        test('number type', () => {
            expect(convertFieldTypeToEnum('number')).toBe(VeloFieldTypeEnum.number)
        })
        test('boolean type', () => {
            expect(convertFieldTypeToEnum('boolean')).toBe(VeloFieldTypeEnum.boolean)
        })
        test('object type', () => {
            expect(convertFieldTypeToEnum('object')).toBe(VeloFieldTypeEnum.object)
        })
        test('datetime type', () => {
            expect(convertFieldTypeToEnum('datetime')).toBe(VeloFieldTypeEnum.datetime)
        })

        test('unsupported type will throw an error', () => {
            expect(() => convertFieldTypeToEnum('unsupported-type')).toThrowError()
        })
    })

    describe('translate velo field type emun to our field type', () => {
        test('text type', () => {
            expect(convertEnumToFieldType(VeloFieldTypeEnum.text)).toBe('text')
        })
        test('number type', () => {
            expect(convertEnumToFieldType(VeloFieldTypeEnum.number)).toBe('number')
        })
        test('boolean type', () => {
            expect(convertEnumToFieldType(VeloFieldTypeEnum.boolean)).toBe('boolean')
        })
        test('object type', () => {
            expect(convertEnumToFieldType(VeloFieldTypeEnum.object)).toBe('object')
        })

        test('datetime type', () => {
            expect(convertEnumToFieldType(VeloFieldTypeEnum.datetime)).toBe('datetime')
        })

        test('unsupported type will throw an error', () => {
            expect(() => convertEnumToFieldType(100)).toThrowError()
        })
    })

    describe('translate velo field type enum to our sub type', () => {
        test('text type', () => {
            expect(subtypeToFieldType(VeloFieldTypeEnum.text)).toBe('string')
        })
        test('number type', () => {
            expect(subtypeToFieldType(VeloFieldTypeEnum.number)).toBe('int')
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
            expect(() => convertEnumToFieldType(100)).toThrowError()
        })

    })

})
