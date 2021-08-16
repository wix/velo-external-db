const { AccessDeniedError, wrongDatabaseError, HostDoesNotExists, errors } = require('velo-external-db-commons')
const each = require('jest-each').default;
const mysql = require('../drivers/mysql_db_operations_test_support')
const postgres = require('../drivers/postgres_db_operations_test_support')


describe('Check Pool Connection', () => {
    each([
        ['MySql', mysql],
        ['Postgres', postgres],
    ]).describe('%s', (dbType, driver) => {

        test('pool connection with wrong password will throw AccessDeniedError.', async () => {
            const dbOperation = driver.dbOperationWithMisconfiguredPassword()
            const validateConnection = await dbOperation.validateConnection()
            expect(validateConnection.valid).toBeFalsy()
            expect(validateConnection.error).toBeInstanceOf(errors.AccessDeniedError)
        })

        test('pool connection with wrong database will throw DatabaseDoesNotExists.', async () => {
            const dbOperation = driver.dbOperationWithMisconfiguredDatabase()
            const validateConnection = await dbOperation.validateConnection()
            expect(validateConnection.valid).toBeFalsy()
            expect(validateConnection.error).toBeInstanceOf(errors.wrongDatabaseError)
        })

        test('pool connection with wrong host will throw HostDoesNotExists.', async () => {
            const dbOperation = driver.dbOperationWithMisconfiguredHost()
            const validateConnection = await dbOperation.validateConnection()
            expect(validateConnection.valid).toBeFalsy()
            expect(validateConnection.error).toBeInstanceOf(errors.HostDoesNotExists)
        })

        test('pool connection with valid DB will not throw', async () => {
            const { dbOperations, cleanup } = driver.dbOperationWithValidDB()
            const validateConnection = await dbOperations.validateConnection()
            expect(validateConnection.valid).toBeTruthy()
            expect(validateConnection.error).not.toBeDefined()
            await cleanup()
        })
    })
})

