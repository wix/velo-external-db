const { init } = require('external-db-firestore')
const {runImage, stopImage} = require('./docker_support')

const setEmulatorOn = () => process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8082'

const connection = () => {
    const {connection, cleanup} = init(['test-project'])

    return { pool: connection, cleanup}
}

const cleanup = async () => {
    setEmulatorOn()
    const {schemaProvider, cleanup} = init(['test-project'])
    const res = await schemaProvider.list()
    const tables = res.map(t => t.id)

    for (const t of tables) {
        await schemaProvider.drop(t)
    }

    await cleanup();
}

const initEnv = async () => {

    await runImage('firestore')
}

const setActive = () => {
    setEmulatorOn()
    process.env.TYPE = 'firestore'
    process.env.PROJECT_ID = 'test-project'
}

const shutdownEnv = async () => {
    await stopImage('firestore')
}

module.exports = { initEnv, shutdownEnv, setActive, connection, cleanup }