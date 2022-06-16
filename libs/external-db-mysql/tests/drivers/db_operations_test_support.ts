import DatabaseOperations from '../../src/mysql_operations'
import init from '../../src/connection_provider'
import { MySqlConfig } from '../../src/types'


const createPool = (modify: MySqlConfig) => {
    const config = {
        host: 'localhost',
        user: 'test-user',
        password: 'password',
        db: 'test-db',
    }

    const { connection, cleanup } = init({ ...config, ...modify }, { connectionLimit: 1, queueLimit: 0 })
    return { connection, cleanup }
}

const dbOperationWithMisconfiguredPassword = () => new DatabaseOperations(createPool( { password: 'wrong' } ).connection)

const dbOperationWithMisconfiguredDatabase = () => new DatabaseOperations(createPool( { db: 'wrong' } ).connection)

const dbOperationWithMisconfiguredHost = () => new DatabaseOperations(createPool( { host: 'wrong' } ).connection)

export const dbOperationWithValidDB = () => {
    const { connection, cleanup } = createPool({ } )
    const dbOperations = new DatabaseOperations( connection )

    return { dbOperations, cleanup }
}

export const misconfiguredDbOperationOptions = () => ([   ['pool connection with wrong password', () => dbOperationWithMisconfiguredPassword()],
                                            ['pool connection with wrong database', () => dbOperationWithMisconfiguredDatabase()],
                                            ['pool connection with wrong host', () => dbOperationWithMisconfiguredHost()]
                                        ])
