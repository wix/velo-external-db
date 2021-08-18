const compose = require('docker-compose')
const { Spanner } = require('@google-cloud/spanner')
// const { init } = require('external-db-spanner')
const { sleep } = require('test-commons')

const connection = () => {
    const projectId = 'test-project'
    const instanceId = 'test-instance'
    const databaseId = 'test-database'

    const spanner = new Spanner({projectId: projectId})
    const instance = spanner.instance(instanceId);
    const pool = instance.database(databaseId);
    return { pool, cleanup: () => {}}
}

// const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const cleanup = async () => {
    // const {schemaProvider, cleanup} = init(['localhost', 'test-user', 'password', 'test-db'])
    // const tables = await schemaProvider.list()
    // await Promise.all(tables.map(t => t.id).map( t => schemaProvider.drop(t) ))
    //
    // await cleanup();
}

const initEnv = async () => {
    process.env.SPANNER_EMULATOR_HOST = 'localhost:9010'

    await compose.upOne('spanner', { cwd: __dirname, log: true })
    // await compose.logs('spanner', { cwd: __dirname, log: true });

    await sleep( 1000 )

    // await cleanup()
}

const setActive = () => {
    process.env.TYPE = 'sql/spanner'
    // process.env.HOST = 'localhost'
    // process.env.USER = 'test-user'
    // process.env.PASSWORD = 'password'
    // process.env.DB = 'test-db'
}

const shutdownEnv = async () => {
    await compose.stopOne('spanner', { cwd: __dirname, log: true })
}

module.exports = { initEnv, shutdownEnv, setActive, connection, cleanup }