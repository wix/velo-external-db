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

const dbOperationGivenDBWithMisconfiguredPassword = () => new DatabaseOperations(createPool( { password: 'wrong'} ))

const dbOperationGivenDBWithMisconfiguredDatabase = () => new DatabaseOperations(createPool( { database: 'wrong'} ))

const dbOperationGivenDBWithMisconfiguredHost = () => new DatabaseOperations(createPool( { host: 'wrong'} ))

const dbOperationGivenValidDB = () => new DatabaseOperations( createPool({ } ))



module.exports = { dbOperationGivenDBWithMisconfiguredPassword, dbOperationGivenDBWithMisconfiguredDatabase, dbOperationGivenDBWithMisconfiguredHost, dbOperationGivenValidDB }