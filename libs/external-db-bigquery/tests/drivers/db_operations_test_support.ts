import DatabaseOperations from '../../src/bigquery_operations'
import init from '../../src/connection_provider'

const createPool = (modify: any) => {
    const config = {}
    const { connection, cleanup } = init({ ...config, ...modify })
    return { connection, cleanup }
}

const dbOperationWithMisconfiguredDatabaseId = () => new DatabaseOperations(createPool({ databaseId: 'wrong' }).connection)

export const dbOperationWithValidDB = () => {
    const { connection, cleanup } = createPool({ databaseId: 'testDB' })
    const dbOperations = new DatabaseOperations(connection)
    return { dbOperations, cleanup }
}

export const misconfiguredDbOperationOptions = () => ([   ['pool connection with wrong databaseId', () => dbOperationWithMisconfiguredDatabaseId()]])
