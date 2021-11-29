const DatabaseOperations = require('../../lib/dynamo_operations')
const init = require('../../lib/connection_provider')

const config = () => ({
    region: 'us-west-2',
    endpoint: 'http://localhost:8000',
})

const createConnection = (_config) => {
    const { connection, cleanup } = init({ ..._config })
    return { connection, cleanup }
}

const dbOperationWithMisconfiguredPassword = () => {
    delete process.env.AWS_ACCESS_KEY_ID
    return new DatabaseOperations(createConnection(config()).connection)
}

const dbOperationWithMisconfiguredDatabase = () => {
    delete process.env.AWS_SECRET_ACCESS_KEY
    return new DatabaseOperations(createConnection(config()).connection)
} 

const dbOperationWithMisconfiguredHost = () => { 
    const _config = config()
    delete _config.region
    return new DatabaseOperations(createConnection(_config).connection)
}

const dbOperationWithValidDB = () => {
    const { connection, cleanup } = createConnection(config())
    const dbOperations = new DatabaseOperations( connection )

    return { dbOperations, cleanup }
}

const resetEnv = () => {
    process.env.AWS_SECRET_ACCESS_KEY = 'TEST_SECRET_ACCESS_KEY'
    process.env.AWS_ACCESS_KEY_ID = 'TEST_ACCESS_KEY_ID'
}


module.exports = {
    dbOperationWithMisconfiguredPassword, dbOperationWithMisconfiguredDatabase,
    dbOperationWithMisconfiguredHost, dbOperationWithValidDB, resetEnv
}