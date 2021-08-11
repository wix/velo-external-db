const {Pool} = require('pg')
const { DatabaseOperations } = require('external-db-postgres')

const config = {
    host: 'localhost',
    user: 'test-user',
    password: 'password',
    database: 'test-db',
    port: 5432,

    max: 1,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
}


const createPool = (modify) => new Pool(Object.assign({}, config, modify ))

const dbOperationWithMisconfiguredPassword = () => new DatabaseOperations(createPool( { password: 'wrong'} ))

const dbOperationWithMisconfiguredDatabase = () => new DatabaseOperations(createPool( { database: 'wrong'} ))

const dbOperationWithMisconfiguredHost = () => new DatabaseOperations(createPool( { host: 'wrong'} ))

const dbOperationWithValidDB = () => new DatabaseOperations( createPool({ } ))

module.exports = {
    dbOperationWithMisconfiguredPassword, dbOperationWithMisconfiguredDatabase,
    dbOperationWithMisconfiguredHost, dbOperationWithValidDB
}