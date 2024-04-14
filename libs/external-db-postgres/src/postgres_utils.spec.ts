

import { DomainIndexStatus } from '@wix-velo/velo-external-db-types'
import { prepareStatementVariablesForBulkInsert, extractIndexFromIndexQueryForCollection } from './postgres_utils'

describe('Postgres utils', () => {
    describe('Prepare statement variables for BulkInsert', () => {
        test('creates bulk insert statement for 2,2', () => {
            const expected = '($1,$2),($3,$4)'
            const result = prepareStatementVariablesForBulkInsert(2, 2)

            expect(result).toEqual(expected)
        })
        test('creates bulk insert statement for 10,1', () => {
            const expected = '($1),($2),($3),($4),($5),($6),($7),($8),($9),($10)'
            const result = prepareStatementVariablesForBulkInsert(10, 1)

            expect(result).toEqual(expected)
        })
        test('creates bulk insert statement for 1,10', () => {
            const expected = '($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)'
            const result = prepareStatementVariablesForBulkInsert(1, 10)

            expect(result).toEqual(expected)
        })
    })



    describe('Index utils functions', () => {
        test('extract DomainIndex from index query on 1 column', () => {
            const indexQuery = 'CREATE INDEX idx_table_col1 ON table(col1)'
            const result = extractIndexFromIndexQueryForCollection(indexQuery)
            const expected = {
                name: 'idx_table_col1',
                columns: ['col1'],
                isUnique: false,
                caseInsensitive: true,
                order: 'ASC',
                status: DomainIndexStatus.BUILDING
            }
            expect(result).toEqual(expected)
        })
        test('extract DomainIndex from unique index query on 1 column', () => {
            const indexQuery = 'CREATE UNIQUE INDEX idx_table_col1 ON table(col1)'
            const result = extractIndexFromIndexQueryForCollection(indexQuery)
            const expected = {
                name: 'idx_table_col1',
                columns: ['col1'],
                isUnique: true,
                caseInsensitive: true,
                order: 'ASC',
                status: DomainIndexStatus.BUILDING
            }
            expect(result).toEqual(expected)
        }) 

        test('extract DomainIndex from unique index query on 2 column', () => {
            const indexQuery = 'CREATE UNIQUE INDEX idx_table_col1_col2 ON table(col1, col2)'
            const result = extractIndexFromIndexQueryForCollection(indexQuery)
            const expected = {
                name: 'idx_table_col1_col2',
                columns: ['col1', 'col2'],
                isUnique: true,
                caseInsensitive: true,
                order: 'ASC',
                status: DomainIndexStatus.BUILDING
            }
            expect(result).toEqual(expected)
        }) 
    })
})
