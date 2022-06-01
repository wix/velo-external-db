const { init, supportedOperations } = require('@wix-velo/external-db-bigquery')

const databaseId = 'testDB'
const projectId = 'corvid-managed-cfe9809c'

const connection = () => {
    const { connection, schemaProvider, cleanup } = init({ databaseId, projectId })
    return { pool: connection, schemaProvider, cleanup }
}

const cleanup = async() => {
    const { schemaProvider } = init({ databaseId, projectId })
    const tables = await schemaProvider.list()
    await Promise.all(tables.map(t => t.id).map( t => schemaProvider.drop(t) ))
}

const initEnv = async() => {
}

const setActive = () => {
    process.env.TYPE = 'bigquery'
    process.env.PROJECT_ID = projectId
    process.env.DATABASE_ID = databaseId
}

const shutdownEnv = async() => {
}

const schemaProviderTestVariables = () => ({ projectId, databaseId })

module.exports = { initEnv, shutdownEnv, setActive, connection, cleanup, schemaProviderTestVariables, supportedOperations }