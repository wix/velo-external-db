const compose = require('docker-compose')
const { init } = require('external-db-firestore')
const { sleep } = require('test-commons')

const connection = () => {
    const {connection, cleanup} = init(['test-project'])

    return { pool: connection, cleanup}
}

const cleanup = async () => {
    const {schemaProvider, cleanup} = init(['test-project'])
    const res = await schemaProvider.list()
    const tables = res.map(t => t.id)

    for (const t of tables) {
        await schemaProvider.drop(t)
    }

    await cleanup();
}

const initEnv = async () => {
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8082'

    await compose.upOne('firestore', { cwd: __dirname, log: true })
    // await compose.logs('firestore', { cwd: __dirname, log: true });

    await sleep( 500 )

    await cleanup()
}

const setActive = () => {
    process.env.TYPE = 'firestore'
    process.env.PROJECT_ID = 'test-project'
}

const shutdownEnv = async () => {
    await compose.stopOne('firestore', { cwd: __dirname, log: true })
}

module.exports = { initEnv, shutdownEnv, setActive, connection, cleanup }