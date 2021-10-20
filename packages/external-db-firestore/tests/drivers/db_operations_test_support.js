const init = require('../../lib/connection_provider')

const createPool = modify => {
    const config = {
        projectId: 'test-project',
    }

    return init(Object.values({ ...config, ...modify }), { min: 0, size: 1 })
}

const unplugEmulator = () => delete process.env.FIRESTORE_EMULATOR_HOST

const setWrongCredentials = () => process.env.GOOGLE_APPLICATION_CREDENTIALS='../../packages/external-db-firestore/tests/drivers/broken_creds.json'

const dbOperationWithMisconfiguredPassword = () => {
    unplugEmulator()
    setWrongCredentials()
    return createPool( { projectId: 'wrong'} ).databaseOperations
}

const unsupported = () => { throw new Error('not supported') }

const dbOperationWithMisconfiguredDatabase = () => unsupported()
const dbOperationWithMisconfiguredHost = () => unsupported()

const dbOperationWithValidDB = () => {
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8082'
    const {databaseOperations, cleanup} = createPool({ } )
    return {dbOperations: databaseOperations, cleanup}
}

module.exports = {
    dbOperationWithMisconfiguredPassword, dbOperationWithMisconfiguredDatabase,
    dbOperationWithMisconfiguredHost, dbOperationWithValidDB
}