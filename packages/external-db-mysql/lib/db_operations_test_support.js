const mysql = require('mysql')
const DatabaseOperations = require('./mysql_operations')

const createPool = modify => {
    const config = {
        host     : 'localhost',
        user     : 'test-user',
        password : 'password',
        database : 'test-db',

        waitForConnections: true,
        namedPlaceholders: true,
        multipleStatements: true,

        connectionLimit: 1,
        queueLimit: 0,
    }
    return mysql.createPool(Object.assign({}, config, modify ))
}

const dbOperationWithMisconfiguredPassword = () => new DatabaseOperations(createPool( { password: 'wrong'} ))

const dbOperationWithMisconfiguredDatabase = () => new DatabaseOperations(createPool( { database: 'wrong'} ))

const dbOperationWithMisconfiguredHost = () => new DatabaseOperations(createPool( { host: 'wrong'} ))

const dbOperationWithValidDB = () => {
    const connection = createPool({ } )
    const dbOperations = new DatabaseOperations( connection )

    return { dbOperations, cleanup: async () => await connection.end(() => {})}
}

module.exports = {
    dbOperationWithMisconfiguredPassword, dbOperationWithMisconfiguredDatabase,
    dbOperationWithMisconfiguredHost, dbOperationWithValidDB
}