import { escapeTable, escapeId } from './mysql_utils'
import { errors } from '@wix-velo/velo-external-db-commons'
const { InvalidQuery } = errors

describe('Mysql Utils', () => {
    test('escape collection id will not allow dots', () => {
        expect( () => escapeTable('db.table') ).toThrow(InvalidQuery)
    })

    test('escape collection id', () => {
        expect( escapeTable('some_table_name') ).toEqual(escapeId('some_table_name'))
    })
})
