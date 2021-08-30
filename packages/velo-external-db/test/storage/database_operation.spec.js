const { errors } = require('velo-external-db-commons')
const each = require('jest-each').default;
const { env, postgresTestEnvInit, mysqlTestEnvInit, spannerTestEnvInit, firestoreTestEnvInit } = require('../resources/operations_resources')


describe('Check Pool Connection', () => {
    each([
        ['MySql', mysqlTestEnvInit],
        ['Postgres', postgresTestEnvInit],
        ['Spanner', spannerTestEnvInit],
        ['Firestore', firestoreTestEnvInit],
    ]).describe('%s', (dbType, setup) => {

        beforeAll(async () => {
            setup()
        })

        test('pool connection with wrong password will throw AccessDeniedError.', async () => {
            const dbOperation = env.driver.dbOperationWithMisconfiguredPassword()

            const validateConnection = await dbOperation.validateConnection()

            expect(validateConnection.valid).toBeFalsy()
            expect(validateConnection.error).toBeInstanceOf(errors.AccessDeniedError)
        })

        test('pool connection with wrong database will throw DatabaseDoesNotExists.', async () => {
            if (dbType !== 'Firestore') {
                const dbOperation = env.driver.dbOperationWithMisconfiguredDatabase()

                const validateConnection = await dbOperation.validateConnection()

                expect(validateConnection.valid).toBeFalsy()
                expect(validateConnection.error).toBeInstanceOf(errors.WrongDatabaseError)
            }
        })

        test('pool connection with wrong host will throw HostDoesNotExists.', async () => {
            if (dbType !== 'Firestore') {
                const dbOperation = env.driver.dbOperationWithMisconfiguredHost()

                const validateConnection = await dbOperation.validateConnection()

                expect(validateConnection.valid).toBeFalsy()
                expect(validateConnection.error).toBeInstanceOf(errors.AccessDeniedError)
            }
        })

        test('pool connection with valid DB will not throw', async () => {
            const { dbOperations, cleanup } = env.driver.dbOperationWithValidDB()

            const validateConnection = await dbOperations.validateConnection()

            expect(validateConnection.valid).toBeTruthy()
            expect(validateConnection.error).not.toBeDefined()
            await cleanup()
        })
    })
})

