const mysql = require('mysql')
const { DatabaseOperations } = require('external-db-mysql')

const config = {
    host     : 'localhost',
    user     : 'test-user',
    password : 'password',
    database : 'test-db',

    waitForConnections: true,
    namedPlaceholders: true,
    multipleStatements: true,

    connectionLimit: 10,
    queueLimit: 0,
}


const createPool = (modify) => mysql.createPool(Object.assign({}, config, modify ))

const dbOperationWithMisconfiguredPassword = () => new DatabaseOperations(createPool( { password: 'wrong'} ))

const dbOperationWithMisconfiguredDatabase = () => new DatabaseOperations(createPool( { database: 'wrong'} ))

const dbOperationWithMisconfiguredHost = () => new DatabaseOperations(createPool( { host: 'wrong'} ))

const dbOperationWithValidDB = () => new DatabaseOperations( createPool({ } ))

module.exports = {
    dbOperationWithMisconfiguredPassword, dbOperationWithMisconfiguredDatabase,
    dbOperationWithMisconfiguredHost, dbOperationWithValidDB
}