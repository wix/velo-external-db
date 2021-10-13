const { init } = require('external-db-mongo')
const { runImage, stopImage } = require('./docker_support')

const connection = async () => {
    const { connection, cleanup } = await init({ connectionUri:'mongodb://root:pass@localhost/testdb' })

    return { pool: connection, cleanup: cleanup }
}

const cleanup = async () => {
    const {schemaProvider, cleanup} = await init({ connectionUri:'mongodb://root:pass@localhost/testdb' })

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
    process.env.URI = 'mongodb://root:pass@localhost/testdb'
}



module.exports = { initEnv, shutdownEnv, setActive, connection, cleanup }