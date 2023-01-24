import { escapeTable, escapeId,  } from './mysql_utils'
import { errors } from '@wix-velo/velo-external-db-commons'
const { InvalidQuery } = errors
// const { eq, ne, string_contains, string_begins, string_ends, gt, gte, lt, lte, include } = AdapterOperators

describe('Mysql Utils', () => {
    test('escape collection id will not allow dots', () => {
        expect( () => escapeTable('db.table') ).toThrow(InvalidQuery)
    })

    test('escape collection id', () => {
        expect( escapeTable('some_table_name') ).toEqual(escapeId('some_table_name'))
    })

})
