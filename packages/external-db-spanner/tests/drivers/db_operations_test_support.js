const init = require('../../lib/connection_provider')

const createPool = modify => {
    const config = {
        projectId: 'test-project',
        instanceId: 'test-instance',
        databaseId: 'test-database',
    }

    return init({ ...config, ...modify }, { min: 0, size: 1 })
}

const dbOperationWithMisconfiguredPassword = () => createPool( { projectId: 'wrong' } ).databaseOperations

const dbOperationWithMisconfiguredDatabase = () => createPool( { databaseId: 'wrong' } ).databaseOperations

const dbOperationWithMisconfiguredHost = () => createPool( { instanceId: 'wrong' } ).databaseOperations

const dbOperationWithValidDB = () => {
    const { databaseOperations, cleanup } = createPool({ } )
    return { dbOperations: databaseOperations, cleanup }
}

module.exports = {
    dbOperationWithMisconfiguredPassword, dbOperationWithMisconfiguredDatabase,
    dbOperationWithMisconfiguredHost, dbOperationWithValidDB
}