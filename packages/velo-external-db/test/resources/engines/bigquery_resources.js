const { init } = require('external-db-bigquery')

const databaseId = 'testDB'

const connection = () => {
    const { connection, cleanup } = init({ databaseId })
    return { pool: connection, cleanup }
}

const cleanup = async() => {
    const { schemaProvider } = init({ databaseId })
    const tables = await schemaProvider.list()
    await Promise.all(tables.map(t => t.id).map( t => schemaProvider.drop(t) ))
}

const initEnv = async() => {
    // await runImage('')
}

const setActive = () => {
    process.env.TYPE = 'bigquery'
    process.env.DATABASE_ID = databaseId
}

const shutdownEnv = async() => {
    // await stopImage('')
}

module.exports = { initEnv, shutdownEnv, setActive, connection, cleanup }