const { init } = require('external-db-spanner')
const { runImage, stopImage } = require('./docker_support')

const setEmulatorOn = () => process.env.SPANNER_EMULATOR_HOST = 'localhost:9010'

const connection = () => {
    const { connection, cleanup } = init({ projectId: 'test-project', instanceId: 'test-instance', databaseId: 'test-database' })
    return { pool: connection, cleanup: cleanup }
}

const cleanup = async() => {
    setEmulatorOn()
    const { schemaProvider, cleanup } = init({ projectId: 'test-project', instanceId: 'test-instance', databaseId: 'test-database' })
    const res = await schemaProvider.list()
    const tables = res.map(t => t.id)

    for (const t of tables) {
        await schemaProvider.drop(t)
    }

    await cleanup()
}

const initEnv = async() => {
    await runImage('spanner')
}

const setActive = () => {
    setEmulatorOn()
    process.env.TYPE = 'spanner'
    process.env.PROJECT_ID = 'test-project'
    process.env.INSTANCE_ID = 'test-instance'
    process.env.DATABASE_ID = 'test-database'
}

const shutdownEnv = async() => {
    await stopImage('spanner')
}

module.exports = { initEnv, shutdownEnv, setActive, connection, cleanup }