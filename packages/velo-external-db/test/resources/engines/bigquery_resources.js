const { init } = require('external-db-bigquery')

const connection = () => {
    // const {connection, cleanup} = init({ host: 'localhost', user: 'test-user', password: 'password', db: 'test-db' }, { max: 1 })
    return { pool: {}, cleanup: () => {} }
}

const cleanup = async() => {
    const { schemaProvider } = init({ databaseId: 'testDB'})
    const tables = await schemaProvider.list()
    await Promise.all(tables.map(t => t.id).map( t => schemaProvider.drop(t) ))
}

const initEnv = async() => {
    // await runImage('')
}

const setActive = () => {
    process.env.TYPE = 'bigquery'
    process.env.DATABASE_ID = 'testDB'
}

const shutdownEnv = async() => {
    // await stopImage('')
}

module.exports = { initEnv, shutdownEnv, setActive, connection, cleanup }