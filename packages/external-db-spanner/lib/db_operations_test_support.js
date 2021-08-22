const { init } = require('external-db-spanner')

const createPool = modify => {
    const config = {
        host: 'test-instance',
        user: 'test-project',
        password: 'ignore',
        database: 'test-database',
    }

    return init(Object.values(Object.assign({}, config, modify)))
}

const dbOperationWithMisconfiguredPassword = () => createPool( { user: 'wrong'} ).databaseOperations

const dbOperationWithMisconfiguredDatabase = () => createPool( { database: 'wrong'} ).databaseOperations

const dbOperationWithMisconfiguredHost = () => createPool( { host: 'wrong'} ).databaseOperations

const dbOperationWithValidDB = () => {
    const {databaseOperations, cleanup} = createPool({ } )
    return {dbOperations: databaseOperations, cleanup}
}

module.exports = {
    dbOperationWithMisconfiguredPassword, dbOperationWithMisconfiguredDatabase,
    dbOperationWithMisconfiguredHost, dbOperationWithValidDB
}