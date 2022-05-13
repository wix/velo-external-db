const DatabaseOperations = require('../../lib/bigquery_operations')
const init = require('../../lib/connection_provider')

const createPool = modify => {
    const config = {}
    const { connection, cleanup } = init({ ...config, ...modify })
    return { connection, cleanup }
}

const dbOperationWithMisconfiguredDatabaseId = () => new DatabaseOperations(createPool({ databaseId: 'wrong' }).connection)

const dbOperationWithValidDB = () => {
    const { connection, cleanup } = createPool({ databaseId: 'testDB' })
    const dbOperations = new DatabaseOperations(connection)
    return { dbOperations, cleanup: cleanup }
}

const misconfiguredDbOperationOptions = () => ([   ['pool connection with wrong databaseId', () => dbOperationWithMisconfiguredDatabaseId()]])

module.exports = {
    misconfiguredDbOperationOptions, dbOperationWithValidDB
}