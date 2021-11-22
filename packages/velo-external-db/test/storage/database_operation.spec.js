const { DbConnectionError } = require('velo-external-db-commons').errors
const each = require('jest-each').default
const { env, testSuits } = require('../resources/operations_resources')

describe('Check Pool Connection', () => {
    each(testSuits()).describe('%s', (dbType, setup, misconfiguredDbOperationOptions) => {

        beforeAll(async() => {
            setup()
        })

        if (dbType === 'MySql') {
            each(misconfiguredDbOperationOptions())
            .test.only('%s will return DbConnectionError',async(message, givenMisconfiguredDbOperation) => {
                const dbOperation = await givenMisconfiguredDbOperation()
    
                const validateConnection = await dbOperation.validateConnection()
    
                expect(validateConnection.valid).toBeFalsy()
                expect(validateConnection.error).toBeInstanceOf(DbConnectionError)
            })

            test.only('pool connection with valid DB will return object with without error', async () => {
                const { dbOperations, cleanup } = await env.driver.dbOperationWithValidDB()
    
                const validateConnection = await dbOperations.validateConnection()
    
                expect(validateConnection.valid).toBeTruthy()
                expect(validateConnection.error).not.toBeDefined()
                await cleanup()
            })
        }
        
        if (dbType !== 'Bigquery') {
            test('pool connection with wrong password will return DbConnectionError.', async() => {
                const dbOperation = await env.driver.dbOperationWithMisconfiguredPassword()
                
                const validateConnection = await dbOperation.validateConnection()
                
                expect(validateConnection.valid).toBeFalsy()
                expect(validateConnection.error).toBeInstanceOf(DbConnectionError)
            })
        }
            

        test('pool connection with wrong password will return DbConnectionError.', async () => {
            const dbOperation = await env.driver.dbOperationWithMisconfiguredPassword()

            const validateConnection = await dbOperation.validateConnection()

            expect(validateConnection.valid).toBeFalsy()
            expect(validateConnection.error).toBeInstanceOf(DbConnectionError)
        })

        if (dbType !== 'Firestore') {
            test('pool connection with wrong database will return DbConnectionError.', async() => {
                const dbOperation = await env.driver.dbOperationWithMisconfiguredDatabase()

                const validateConnection = await dbOperation.validateConnection()

                expect(validateConnection.valid).toBeFalsy()
                expect(validateConnection.error).toBeInstanceOf(DbConnectionError)
            })
        }

        if (dbType !== 'Bigquery' && dbType !== 'Firestore') {
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

})

