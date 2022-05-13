const { init, supportedOperations } = require('external-db-postgres')
const { runImage, stopImage } = require('./docker_support')

const connection = () => {
    const { connection, schemaProvider, cleanup } = init({ host: 'localhost', user: 'test-user', password: 'password', db: 'test-db' }, { max: 1 })
    return { pool: connection, schemaProvider, cleanup: cleanup }
}

const cleanup = async() => {
    const { schemaProvider, cleanup } = init({ host: 'localhost', user: 'test-user', password: 'password', db: 'test-db' }, { max: 1 })
    const tables = await schemaProvider.list()
    await Promise.all(tables.map(t => t.id).map( t => schemaProvider.drop(t) ))

    await cleanup()
}

const initEnv = async() => {
    await runImage('postgres')
}

const setActive = () => {
    process.env.TYPE = 'postgres'
    process.env.HOST = 'localhost'
    process.env.USER = 'test-user'
    process.env.PASSWORD = 'password'
    process.env.DB = 'test-db'
}

const shutdownEnv = async() => {
    await stopImage('postgres')
}

module.exports = { initEnv, shutdownEnv, setActive, connection, cleanup, supportedOperations }