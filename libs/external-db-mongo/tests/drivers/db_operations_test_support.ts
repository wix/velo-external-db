import DatabaseOperations from '../../src/mongo_operations'
import { MongoClient } from 'mongodb'

type MongoConfig = {
    user?: string,
    password?: string,
    database?: string,
    host?: string,
    uri?: string
}

const createPool = (modify: MongoConfig): MongoClient => {
    const config = {
        user: 'root',
        password: 'pass',
        database: 'testdb',
        host: 'localhost'
    }
    const modifiedConfig =  { ...config, ...modify }
    const uri = `mongodb://${modifiedConfig.user}:${modifiedConfig.password}@${modifiedConfig.host}/${modifiedConfig.database}`
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 })
    return client
}

const dbOperationWithMisconfiguredPassword = () => new DatabaseOperations(createPool( { password: 'wrong' } ))

const dbOperationWithMisconfiguredDatabase = () => new DatabaseOperations(createPool( { database: 'wrong' } ))

const dbOperationWithMisconfiguredHost = () => new DatabaseOperations(createPool( { host: 'wrong' } ))

const dbOperationWithValidDB = () => {
    const connection = createPool({ } )
    const dbOperations = new DatabaseOperations( connection )

    return { dbOperations, cleanup: async() => await connection.close() }
}

const misconfiguredDbOperationOptions = () => ([   ['pool connection with wrong password', () => dbOperationWithMisconfiguredPassword()],
                                            ['pool connection with wrong database', () => dbOperationWithMisconfiguredDatabase()],
                                            ['pool connection with wrong host', () => dbOperationWithMisconfiguredHost()]
                                        ])

module.exports = {
    misconfiguredDbOperationOptions, dbOperationWithValidDB
}