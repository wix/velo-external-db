const DatabaseOperations = require('../../lib/postgres_operations')
const init = require('../../lib/connection_provider')

const createPool = modify => {
    const config = {
        host: 'localhost',
        user: 'test-user',
        password: 'password',
        db: 'test-db',
    }
    const { connection, cleanup } = init({ ...config, ...modify }, { max: 1 })
    return { connection, cleanup }
}

const dbOperationWithMisconfiguredPassword = () => new DatabaseOperations(createPool( { password: 'wrong' } ).connection)

const dbOperationWithMisconfiguredDatabase = () => new DatabaseOperations(createPool( { db: 'wrong' } ).connection)

const dbOperationWithMisconfiguredHost = () => new DatabaseOperations(createPool( { host: 'wrong' } ).connection)

const dbOperationWithValidDB = () => {
    const { connection, cleanup } = createPool({ } )
    const dbOperations = new DatabaseOperations(connection)
    return { dbOperations, cleanup: cleanup }
}

const misconfiguredDbOperationOptions = () => ([   ['pool connection with wrong password', () => dbOperationWithMisconfiguredPassword()],
                                            ['pool connection with wrong database', () => dbOperationWithMisconfiguredDatabase()],
                                            ['pool connection with wrong host', () => dbOperationWithMisconfiguredHost()]
                                        ])


module.exports = {
    dbOperationWithValidDB, misconfiguredDbOperationOptions
}