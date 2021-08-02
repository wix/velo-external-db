const { AccessDeniedError, wrongDatabaseError, HostDoesNotExists } = require('velo-external-db-commons')
const each = require('jest-each').default;
const mysql = require('../drivers/mysql_db_operations_test_support')
const postgres = require('../drivers/postgres_db_operations_test_support')


describe('Check Pool Connection', () => {
    each([
        ['MySql', mysql],
        ['Postgres', postgres],
    ]).describe('%s', (dbType, driver) => {

        test('pool connection with wrong password will throw AccessDeniedError.', async () => {
            const dbOperation = driver.dbOperationGivenDBWithMisconfiguredPassword()
            await expect(dbOperation.checkIfConnectionSucceeded()).rejects.toThrow(AccessDeniedError)
        })

        test('pool connection with wrong database will throw DatabaseDoesNotExists.', async () => {
            const dbOperation = driver.dbOperationGivenDBWithMisconfiguredDatabase()
            await expect(dbOperation.checkIfConnectionSucceeded()).rejects.toThrow(wrongDatabaseError)
        })

        test('pool connection with wrong host will throw HostDoesNotExists.', async () => {
            const dbOperation = driver.dbOperationGivenDBWithMisconfiguredHost()
            await expect(dbOperation.checkIfConnectionSucceeded()).rejects.toThrow(HostDoesNotExists)
        })
        test('pool connection with valid DB will not throw', async () => {
            const dbOperation = driver.dbOperationGivenValidDB()
            await expect(dbOperation.checkIfConnectionSucceeded()).resolves.not.toThrow();
        })
    })
})
