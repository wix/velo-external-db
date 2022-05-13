const DatabaseOperations = require('../../src/dynamo_operations')
const init = require('../../src/connection_provider')

const config = () => ({
    region: 'us-west-2',
    endpoint: 'http://localhost:8000',
})

const createConnection = (_config) => {
    const { connection, cleanup } = init(_config)
    return { connection, cleanup }
}

const dbOperationWithMisconfiguredAwsAccessKeyId = () => {
    delete process.env.AWS_ACCESS_KEY_ID
    return new DatabaseOperations(createConnection(config()).connection)
}

const dbOperationWithMisconfiguredAwsSecretAccessKey = () => {
    delete process.env.AWS_SECRET_ACCESS_KEY
    return new DatabaseOperations(createConnection(config()).connection)
} 

const dbOperationWithMisconfiguredRegion = () => { 
    const _config = config()
    delete _config.region
    return new DatabaseOperations(createConnection(_config).connection)
}

const dbOperationWithValidDB = () => {
    const { connection, cleanup } = createConnection(config())
    const dbOperations = new DatabaseOperations( connection )

    return { dbOperations, cleanup }
}

const misconfiguredDbOperationOptions = () => ([   ['pool connection without AWS_ACCESS_KEY_ID', () => dbOperationWithMisconfiguredAwsAccessKeyId()],
                                            ['pool connection without AWS_SECRET_ACCESS_KEY', () => dbOperationWithMisconfiguredAwsSecretAccessKey()],
                                            ['pool connection without region', () => dbOperationWithMisconfiguredRegion()]
                                        ])

const resetEnv = () => {
    process.env.AWS_SECRET_ACCESS_KEY = 'TEST_SECRET_ACCESS_KEY'
    process.env.AWS_ACCESS_KEY_ID = 'TEST_ACCESS_KEY_ID'
}


module.exports = {
    misconfiguredDbOperationOptions, dbOperationWithValidDB, resetEnv
}