const { init } = require('external-db-bigquery')

const connection = () => {
    // const {connection, cleanup} = init({ host: 'localhost', user: 'test-user', password: 'password', db: 'test-db' }, { max: 1 })
    return { pool: {}, cleanup: () => {} }
}

const cleanup = async() => {
    // const {schemaProvider, cleanup} = init({ host: 'localhost', user: 'test-user', password: 'password', db: 'test-db' }, { max: 1 })
    // const tables = await schemaProvider.list()
    // await Promise.all(tables.map(t => t.id).map( t => schemaProvider.drop(t) ))

    // await cleanup();
}

const initEnv = async () => {
    // await runImage('postgres')
}

const setActive = () => {
    process.env.TYPE = 'bigquery'
    process.env.DATABASE_ID = 'testDB'
}

const shutdownEnv = async () => {
    // await stopImage('postgres')
}

module.exports = { initEnv, shutdownEnv, setActive, connection, cleanup }