const { init } = require('external-db-mariadb')
const { runImage, stopImage } = require('./docker_support')
const { waitUntil } = require('async-wait-until')

const connection = () => {
    const {connection, cleanup} = init({ host: 'localhost', user: 'test-user', password: 'password', db: 'test-db'}, { connectionLimit: 1, queueLimit: 0 })
    return { pool: connection, cleanup: cleanup}
}

const cleanup = async () => {
    const {schemaProvider, databaseOperations, cleanup} = init({ host: 'localhost', user: 'test-user', password: 'password', db: 'test-db'}, { connectionLimit: 1, queueLimit: 0 })
    await waitUntil(async () => (await databaseOperations.validateConnection()).valid)
    const tables = await schemaProvider.list()
    await Promise.all(tables.map(t => t.id).map( t => schemaProvider.drop(t) ))

    await cleanup();
}

const initEnv = async () => {
    await runImage('mariadb')
}

const shutdownEnv = async () => {
    await stopImage('mariadb')
}

const setActive = () => {
    process.env.TYPE = 'mariadb'
    process.env.HOST = 'localhost'
    process.env.USER = 'test-user'
    process.env.PASSWORD = 'password'
    process.env.DB = 'test-db'
}



module.exports = { initEnv, shutdownEnv, setActive, connection, cleanup }