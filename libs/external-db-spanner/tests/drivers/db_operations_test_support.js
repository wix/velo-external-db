const init = require('../../src/connection_provider')

const createPool = modify => {
    const config = {
        projectId: 'test-project',
        instanceId: 'test-instance',
        databaseId: 'test-database',
    }

    return init({ ...config, ...modify }, { min: 0, size: 1 })
}

const dbOperationWithMisconfiguredProjectId = () => createPool( { projectId: 'wrong' } ).databaseOperations

const dbOperationWithMisconfiguredDatabaseId = () => createPool( { databaseId: 'wrong' } ).databaseOperations

const dbOperationWithMisconfiguredInstanceId = () => createPool( { instanceId: 'wrong' } ).databaseOperations

const dbOperationWithValidDB = () => {
    const { databaseOperations, cleanup } = createPool({ } )
    return { dbOperations: databaseOperations, cleanup }
}

const misconfiguredDbOperationOptions = () => ([   ['pool connection with wrong projectId', () => dbOperationWithMisconfiguredProjectId()],
                                            ['pool connection with wrong databaseId', () => dbOperationWithMisconfiguredDatabaseId()],
                                            ['pool connection with wrong instanceId', () => dbOperationWithMisconfiguredInstanceId()]
                                        ])


module.exports = {
     dbOperationWithValidDB, misconfiguredDbOperationOptions
}