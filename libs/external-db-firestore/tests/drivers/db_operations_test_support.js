const init = require('../../lib/connection_provider')

const createPool = modify => {
    const config = {
        projectId: 'test-project',
    }

    return init(Object.values({ ...config, ...modify }), { min: 0, size: 1 })
}

const unplugEmulator = () => delete process.env.FIRESTORE_EMULATOR_HOST

const setWrongCredentials = () => process.env.GOOGLE_APPLICATION_CREDENTIALS='../../packages/external-db-firestore/tests/drivers/broken_creds.json'

const dbOperationWithMisconfiguredProjectId = () => {
    unplugEmulator()
    setWrongCredentials()
    return createPool( { projectId: 'wrong' } ).databaseOperations
}

const dbOperationWithValidDB = () => {
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8082'
    const { databaseOperations, cleanup } = createPool({ } )
    return { dbOperations: databaseOperations, cleanup }
}

const misconfiguredDbOperationOptions = () => ([['pool connection with wrong projectId.', () => dbOperationWithMisconfiguredProjectId()]])

module.exports = {
    dbOperationWithValidDB, misconfiguredDbOperationOptions 
}