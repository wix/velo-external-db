

import { prepareStatementVariablesForBulkInsert } from './postgres_utils'

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

})
