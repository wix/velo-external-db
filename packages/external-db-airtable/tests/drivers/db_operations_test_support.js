const DatabaseOperations = require('../../lib/airtable_operations')
const init = require('../../lib/connection_provider')

const createPool = modify => {
    const config = {
        privateApiKey: 'key123',
        baseId: 'app123'
    }

    const { connection, cleanup } =  init(Object.assign({}, config, modify), { endpointUrl: 'http://localhost:9000', requestTimeout: 1000 })
    return { connection, cleanup }
}

const dbOperationWithMisconfiguredPassword = () => new DatabaseOperations(createPool({ privateApiKey: 'wrong' }).connection)

const dbOperationWithMisconfiguredDatabase = () => new DatabaseOperations(createPool({ baseId: 'wrong' }).connection)

const dbOperationWithMisconfiguredHost = () => new DatabaseOperations(createPool({ privateApiKey: 'wrong' }).connection)

const dbOperationWithValidDB = () => {
    const { connection, cleanup } = createPool({ } )
    const dbOperations = new DatabaseOperations(connection)

    return { dbOperations, cleanup }
}

module.exports = {
    dbOperationWithMisconfiguredPassword, dbOperationWithMisconfiguredDatabase,
    dbOperationWithMisconfiguredHost, dbOperationWithValidDB
}