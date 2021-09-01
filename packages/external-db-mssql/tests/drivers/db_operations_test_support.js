const { ConnectionPool } = require('mssql')
const DatabaseOperations = require('../../lib/mssql_operations')

const createPool = modify => {
    const config = {
        user: 'sa',
        password: 't9D4:EHfU6Xgccs-',
        database: 'tempdb',
        server: 'localhost',
        port: 1433,
        pool: {
            max: 1,
            min: 0,
            idleTimeoutMillis: 30000
        },
        options: {
            // encrypt: true, // for azure
            trustServerCertificate: true // change to true for local dev / self-signed certs
        }
    }

    const _pool = new ConnectionPool(Object.assign({}, config, modify ))
    return _pool.connect()
}

const dbOperationWithMisconfiguredPassword = () => new DatabaseOperations(createPool( { password: 'wrong'} ))

const dbOperationWithMisconfiguredDatabase = () => new DatabaseOperations(createPool( { database: 'wrong'} ))

const dbOperationWithMisconfiguredHost = () => new DatabaseOperations(createPool( { server: 'wrong'} ))

const dbOperationWithValidDB = () => {
    const connection = createPool({ } )
    const dbOperations = new DatabaseOperations( connection )

    return { dbOperations, cleanup: async () => await (await connection).close()}
}

module.exports = {
    dbOperationWithMisconfiguredPassword, dbOperationWithMisconfiguredDatabase,
    dbOperationWithMisconfiguredHost, dbOperationWithValidDB
}