import { init } from '@wix-velo/external-db-spanner'
import { runImage, stopImage } from './docker_support'
export { supportedOperations } from '@wix-velo/external-db-spanner'

const setEmulatorOn = () => process.env.SPANNER_EMULATOR_HOST = 'localhost:9010'

export const connection = () => {
    const { connection, schemaProvider, cleanup } = init({ projectId: 'test-project', instanceId: 'test-instance', databaseId: 'test-database' })
    return { pool: connection, schemaProvider, cleanup: cleanup }
}

export const cleanup = async() => {
    setEmulatorOn()
    const { schemaProvider, cleanup } = init({ projectId: 'test-project', instanceId: 'test-instance', databaseId: 'test-database' })
    const res = await schemaProvider.list()
    const tables = res.map(t => t.id)

    for (const t of tables) {
        await schemaProvider.drop(t)
    }

    await cleanup()
}

export const initEnv = async() => {
    await runImage('spanner')
}

export const setActive = () => {
    setEmulatorOn()
    process.env.TYPE = 'spanner'
    process.env.PROJECT_ID = 'test-project'
    process.env.INSTANCE_ID = 'test-instance'
    process.env.DATABASE_ID = 'test-database'
}

export const shutdownEnv = async() => {
    await stopImage('spanner')
}
