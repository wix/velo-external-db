import { init } from '@wix-velo/external-db-firestore'
import { runImage, stopImage } from './docker_support'
export { supportedOperations } from '@wix-velo/external-db-firestore'

const setEmulatorOn = () => process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8082'

export const connection = () => {
    const { connection, schemaProvider, cleanup } = init({ projectId: 'test-project' })

    return { pool: connection, schemaProvider, cleanup }
}

export const cleanup = async() => {
    setEmulatorOn()
    const { schemaProvider, cleanup } = init({ projectId: 'test-project' })
    const res = await schemaProvider.list()
    const tables = res.map(t => t.id)

    for (const t of tables) {
        await schemaProvider.drop(t)
    }

    await cleanup()
}

export const initEnv = async() => {

    await runImage('firestore')
}

export const setActive = () => {
    setEmulatorOn()
    process.env.TYPE = 'firestore'
    process.env.PROJECT_ID = 'test-project'
}

export const shutdownEnv = async() => {
    await stopImage('firestore')
}
