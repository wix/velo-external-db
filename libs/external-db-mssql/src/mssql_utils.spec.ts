import { errors } from '@wix-velo/velo-external-db-commons'
import { escapeTable, escapeId } from './mssql_utils'
const { InvalidQuery } = errors

describe('Sql Server Utils', () => {
    test('escape collection id will not allow dots', () => {
        expect( () => escapeTable('db.table') ).toThrow(InvalidQuery)
    })

    test('escape collection id', () => {
        expect( escapeTable('some_table_name') ).toEqual(escapeId('some_table_name'))
    })
})
