const { DbConnectionError } = require('velo-external-db-commons').errors
const { env, testedSuit } = require('../resources/operations_resources')

describe(`Check Pool Connection: ${testedSuit().name}`, () => {
    beforeAll(async() => {
        testedSuit().setup()
    })

    if (testedSuit().name !== 'Bigquery') {
        test('pool connection with wrong password will return DbConnectionError.', async() => {
            const dbOperation = await env.driver.dbOperationWithMisconfiguredPassword()

            const validateConnection = await dbOperation.validateConnection()

            expect(validateConnection.valid).toBeFalsy()
            expect(validateConnection.error).toBeInstanceOf(DbConnectionError)
        })
    }

    if (testedSuit().name !== 'Firestore') {
        test('pool connection with wrong database will return DbConnectionError.', async() => {
            const dbOperation = await env.driver.dbOperationWithMisconfiguredDatabase()

            const validateConnection = await dbOperation.validateConnection()

            expect(validateConnection.valid).toBeFalsy()
            expect(validateConnection.error).toBeInstanceOf(DbConnectionError)
        })
    }

    if (testedSuit().name !== 'Bigquery' && testedSuit().name !== 'Firestore') {
        test('pool connection with wrong host will return DbConnectionError.', async() => {
            const dbOperation = await env.driver.dbOperationWithMisconfiguredHost()
            const validateConnection = await dbOperation.validateConnection()

            expect(validateConnection.valid).toBeFalsy()
            expect(validateConnection.error).toBeInstanceOf(DbConnectionError)
        })
    }

    test('pool connection with valid DB will return object with without error', async() => {
        const { dbOperations, cleanup } = await env.driver.dbOperationWithValidDB()

        const validateConnection = await dbOperations.validateConnection()

        expect(validateConnection.valid).toBeTruthy()
        expect(validateConnection.error).not.toBeDefined()
        await cleanup()
    })

    afterEach(() => {
        env.driver.resetEnv?.()
    })

})

