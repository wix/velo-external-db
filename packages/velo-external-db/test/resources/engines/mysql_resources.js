const { init } = require('external-db-mysql')
const { runImage, stopImage } = require('./docker_support')
const { sleep } = require('test-commons');

const connection = () => {
    const {connection, cleanup} = init({ host: 'localhost', user: 'test-user', password: 'password', db: 'test-db'}, { connectionLimit: 1, queueLimit: 0 })
    return { pool: connection, cleanup: cleanup}
}

const cleanup = async () => {
    await sleep( 5000 )
    const {schemaProvider, cleanup} = init({ host: 'localhost', user: 'test-user', password: 'password', db: 'test-db'}, { connectionLimit: 1, queueLimit: 0 })
    const tables = await schemaProvider.list()
    await Promise.all(tables.map(t => t.id).map( t => schemaProvider.drop(t) ))

    await cleanup();
}

const initEnv = async () => {
    await runImage('mysql', true)
}

const shutdownEnv = async () => {
    await stopImage('mysql')
}

const setActive = () => {
    process.env.TYPE = 'mysql'
    process.env.HOST = 'localhost'
    process.env.USER = 'test-user'
    process.env.PASSWORD = 'password'
    process.env.DB = 'test-db'
}



module.exports = { initEnv, shutdownEnv, setActive, connection, cleanup }