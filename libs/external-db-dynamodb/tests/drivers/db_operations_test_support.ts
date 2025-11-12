import DatabaseOperations from '../../src/dynamo_operations'
import init from '../../src/connection_provider'

const config = () => ({
    region: 'us-west-2',
    endpoint: 'http://localhost:8000',
})

const createConnection = (_config: any) => {
    const { connection, cleanup } = init(_config)
    return { connection, cleanup }
}

const dbOperationWithMisconfiguredAwsAccessKeyId = () => {
    // Use an invalid endpoint to force connection failure
    const _config = { ...config(), endpoint: 'http://localhost:9999' }
    return new DatabaseOperations(createConnection(_config).connection)
}

const dbOperationWithMisconfiguredAwsSecretAccessKey = () => {
    // Use an invalid endpoint to force connection failure
    const _config = { ...config(), endpoint: 'http://invalid-host:8000' }
    return new DatabaseOperations(createConnection(_config).connection)
} 

const dbOperationWithMisconfiguredRegion = () => { 
    const _config: {region?: string, endpoint?: string} = config()
    delete _config.region
    return new DatabaseOperations(createConnection(_config).connection)
}

export const dbOperationWithValidDB = () => {
    const { connection, cleanup } = createConnection(config())
    const dbOperations = new DatabaseOperations( connection )

    return { dbOperations, cleanup }
}

export const misconfiguredDbOperationOptions = () => ([   ['pool connection without AWS_ACCESS_KEY_ID', () => dbOperationWithMisconfiguredAwsAccessKeyId()],
                                            ['pool connection without AWS_SECRET_ACCESS_KEY', () => dbOperationWithMisconfiguredAwsSecretAccessKey()],
                                            ['pool connection without region', () => dbOperationWithMisconfiguredRegion()]
                                        ])

export const resetEnv = () => {
    process.env['AWS_SECRET_ACCESS_KEY'] = 'TestSecretAccessKey'
    process.env['AWS_ACCESS_KEY_ID'] = 'TestAccessKeyId'
}
