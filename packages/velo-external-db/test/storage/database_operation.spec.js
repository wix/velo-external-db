const { DbConnectionError } = require('velo-external-db-commons').errors
const each = require('jest-each').default;
const { env, testSuits } = require('../resources/operations_resources')
const { Uninitialized, gen } = require('test-commons')

describe('Check Pool Connection', () => {
    each(testSuits()).describe('%s', (dbType, setup) => {

        beforeAll(async () => {
            setup()
        })

        //1
        if (dbType === 'Mongo')
            test('pool connection with wrong config will return object with valid equal to false and DbConnectionError.', async () => {
                const dbOperation = (gen.randomObjectFromArray(env.driver.dbOperationWithMisconfiguredConfig))() 
                // todo - move randomObjectFromArray to beforeEach if we keeping this and implement dbOperationWithMisconfiguredConfig for every driver.

                const validateConnection = await dbOperation.validateConnection()

                expect(validateConnection.valid).toBeFalsy()
                expect(validateConnection.error).toBeInstanceOf(DbConnectionError)
            })

        test('pool connection with wrong password will return appropriate error.', async () => {
            const dbOperation = await env.driver.dbOperationWithMisconfiguredPassword()

            const validateConnection = await dbOperation.validateConnection()

            expect(validateConnection.valid).toBeFalsy()
            expect(validateConnection.error).toBeInstanceOf(DbConnectionError)
            expect(validateConnection.error.message).toMatch(/(wrong credentials|Authentication failed)/i)
        })

        if (dbType !== 'Firestore' && dbType !== 'Mongo') {
            test('pool connection with wrong database will return appropriate error.', async () => {
                const dbOperation = await env.driver.dbOperationWithMisconfiguredDatabase()

                const validateConnection = await dbOperation.validateConnection()

                expect(validateConnection.valid).toBeFalsy()
                expect(validateConnection.error).toBeInstanceOf(DbConnectionError)
            })

            test('pool connection with wrong host will return appropriate error.', async () => {
                const dbOperation = await env.driver.dbOperationWithMisconfiguredHost()

                const validateConnection = await dbOperation.validateConnection()

                expect(validateConnection.valid).toBeFalsy()
                expect(validateConnection.error.message).toContain('host is unavailable')
                expect(validateConnection.error).toBeInstanceOf(DbConnectionError)
            })
        }

        //2
        test('pool connection with valid DB will return object with without error', async () => {
            const { dbOperations, cleanup } = await env.driver.dbOperationWithValidDB()

            const validateConnection = await dbOperations.validateConnection()

            expect(validateConnection.valid).toBeTruthy()
            expect(validateConnection.error).not.toBeDefined()
            await cleanup()
        })
    })
    
    const ctx = {
        // dbOperationWithMisconfiguredConfig: Uninitialized
    }

    beforeEach(() => {
        // ctx.dbOperationWithMisconfiguredConfig = gen.randomObjectFromArray(env.driver.dbOperationWithMisconfiguredConfig)
    });
})

