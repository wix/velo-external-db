const init = require ('../../src/connection_provider')
export { supportedOperations } from '../../src/supported_operations'

const databaseId = 'testDB'
const projectId = 'corvid-managed-cfe9809c'

export const connection = () => {
    const { connection, schemaProvider, cleanup } = init({ databaseId, projectId })
    return { pool: connection, schemaProvider, cleanup }
}

export const cleanup = async() => {
    const { schemaProvider } = init({ databaseId, projectId })
    const tables = await schemaProvider.list()
    await Promise.all(tables.map((t: { id: any }) => t.id).map( (t: any) => schemaProvider.drop(t) ))
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const initEnv = async() => {}

export const setActive = () => {
    process.env['TYPE'] = 'bigquery'
    process.env['PROJECT_ID'] = projectId
    process.env['DATABASE_ID'] = databaseId
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const shutdownEnv = async() => {}

export const schemaProviderTestVariables = () => ({ projectId, databaseId })

export const name = 'bigquery'
