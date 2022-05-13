const { ConnectionPool } = require('mssql')
const DatabaseOperations = require('../../src/mssql_operations')

const createPool = async modify => {
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

    const _pool = new ConnectionPool({ ...config, ...modify })
    const pool = await _pool.connect().then((pool) => { return pool }).catch(() => { return _pool })
    return pool
}

const dbOperationWithMisconfiguredPassword = async() => new DatabaseOperations(await createPool({ password: 'wrong' }))

const dbOperationWithMisconfiguredDatabase = async() => new DatabaseOperations(await createPool({ database: 'wrong' }))

const dbOperationWithMisconfiguredServer = async() => new DatabaseOperations(await createPool({ server: 'wrong' }))

const dbOperationWithValidDB = async() => {
    const connection = await createPool({ })
    const dbOperations = new DatabaseOperations( connection )

    return { dbOperations, cleanup: async() => await (await connection).close() }
}

const misconfiguredDbOperationOptions = () => ([   ['pool connection with wrong password', () => dbOperationWithMisconfiguredPassword()],
                                            ['pool connection with wrong database', () => dbOperationWithMisconfiguredDatabase()],
                                            ['pool connection with wrong server', () => dbOperationWithMisconfiguredServer()]
                                        ])

module.exports = {
    dbOperationWithValidDB, misconfiguredDbOperationOptions
}