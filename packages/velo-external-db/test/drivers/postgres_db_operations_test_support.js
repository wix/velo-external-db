const {Pool} = require('pg')
const { DatabaseOperations } = require('external-db-mysql')

const config = {
    host: 'localhost',
    user: 'test-user',
    password: 'password',
    database: 'test-db',
    port: 5432,

    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
}


const createPool = (modify) => new Pool(Object.assign({}, config, modify ))

const dbOperationGivenDBWithMisconfiguredPassword = () => new DatabaseOperations(createPool( { password: 'wrong'} ))

const dbOperationGivenDBWithMisconfiguredDatabase = () => new DatabaseOperations(createPool( { database: 'wrong'} ))

const dbOperationGivenDBWithMisconfiguredHost = () => new DatabaseOperations(createPool( { host: 'wrong'} ))

const dbOperationGivenValidDB = () => new DatabaseOperations( createPool({ } ))



module.exports = { dbOperationGivenDBWithMisconfiguredPassword, dbOperationGivenDBWithMisconfiguredDatabase, dbOperationGivenDBWithMisconfiguredHost, dbOperationGivenValidDB }