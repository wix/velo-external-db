const each = require('jest-each').default
const { DbConnectionError } = require('@wix-velo/velo-external-db-commons').errors
const { env, setupDb, currentDbImplementationName, misconfiguredDbOperationOptions } = require('../resources/operations_resources')

describe(`Check Pool Connection: ${currentDbImplementationName()}`, () => {
    beforeAll(async() => {
        setupDb()
    })

    each(misconfiguredDbOperationOptions())
    .test('%s will return DbConnectionError', async(message, givenMisconfiguredDbOperation) => {
        const dbOperation = await givenMisconfiguredDbOperation()

        const validateConnection = await dbOperation.validateConnection()

        expect(validateConnection.valid).toBeFalsy()
        expect(validateConnection.error).toBeInstanceOf(DbConnectionError)
    })

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

