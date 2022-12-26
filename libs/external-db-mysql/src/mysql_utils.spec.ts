import { escapeTable, escapeId, columnCapabilitiesFor } from './mysql_utils'
import { errors, AdapterOperators } from '@wix-velo/velo-external-db-commons'
const { InvalidQuery } = errors
const { eq, ne, string_contains, string_begins, string_ends, gt, gte, lt, lte, include } = AdapterOperators

describe('Mysql Utils', () => {
    test('escape collection id will not allow dots', () => {
        expect( () => escapeTable('db.table') ).toThrow(InvalidQuery)
    })

    test('escape collection id', () => {
        expect( escapeTable('some_table_name') ).toEqual(escapeId('some_table_name'))
    })

    describe('translate column type to column capabilities object', () => {
        test('number column type', () => {
            expect(columnCapabilitiesFor('number')).toEqual({
                sortable: true,
                columnQueryOperators: [eq, ne, gt, gte, lt, lte, include]
            })
        })
        test('text column type', () => {
            expect(columnCapabilitiesFor('text')).toEqual({
                sortable: true,
                columnQueryOperators: [eq, ne, string_contains, string_begins, string_ends, include, gt, gte, lt, lte]
            })
        })

        test('url column type', () => {
            expect(columnCapabilitiesFor('url')).toEqual({
                sortable: true,
                columnQueryOperators: [eq, ne, string_contains, string_begins, string_ends, include, gt, gte, lt, lte]
            })
        })

        test('boolean column type', () => {
            expect(columnCapabilitiesFor('boolean')).toEqual({
                sortable: true,
                columnQueryOperators: [eq]
            })
        })

        test('image column type', () => {
            expect(columnCapabilitiesFor('image')).toEqual({
                sortable: false,
                columnQueryOperators: []
            })
        })

        test('datetime column type', () => {
            expect(columnCapabilitiesFor('datetime')).toEqual({
                sortable: true,
                columnQueryOperators: [eq, ne, gt, gte, lt, lte]
            })
        })

        test('unsupported field type will throw', () => {
            expect(() => columnCapabilitiesFor('unsupported-type')).toThrowError()
        })
    })

})
