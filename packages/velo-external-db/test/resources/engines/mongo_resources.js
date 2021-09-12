const { init } = require('external-db-mongo')
const { runImage, stopImage } = require('./docker_support')

const connection = async () => {
    const { connection, cleanup } = await init({ host: 'localhost', user: 'root', password: 'pass', db: 'testdb' })

    return { pool: connection, cleanup: cleanup }
}

const cleanup = async () => {
    const {schemaProvider, cleanup} = await init({ host: 'localhost', user: 'root', password: 'pass', db: 'testdb' })

    const tables = await schemaProvider.list()
    await Promise.all(tables.map(t => t.id).map( t => schemaProvider.drop(t) ))

    await cleanup();
}

const initEnv = async () => {
    await runImage('mongo')
}

const shutdownEnv = async () => {
    await stopImage('mongo')
}

const setActive = () => {
    process.env.TYPE = 'mongo'
    process.env.HOST = 'localhost'
    process.env.USER = 'root'
    process.env.PASSWORD = 'pass'
    process.env.DB = 'testdb'
}



module.exports = { initEnv, shutdownEnv, setActive, connection, cleanup }