export { supportedOperations } from '../../src/supported_operations'
const init = require('../../src/connection_provider')

import * as compose from 'docker-compose'

const setEmulatorOn = () => process.env['FIRESTORE_EMULATOR_HOST'] = 'localhost:8082'

export const connection = () => {
    const { connection, schemaProvider, cleanup } = init({ projectId: 'test-project' })

    return { pool: connection, schemaProvider, cleanup }
}

export const cleanup = async() => {
    setEmulatorOn()
    const { schemaProvider, cleanup } = init({ projectId: 'test-project' })
    const res = await schemaProvider.list()
    const tables = res.map((t: { id: any }) => t.id)

    for (const t of tables) {
        await schemaProvider.drop(t)
    }

    await cleanup()
}

export const initEnv = async() => {
    await compose.upOne('firestore', { cwd: __dirname, log: true, commandOptions: [['--force-recreate', '--remove-orphans']] })

}

export const setActive = () => {
    setEmulatorOn()
    process.env['TYPE'] = 'firestore'
    process.env['PROJECT_ID'] = 'test-project'
}

export const shutdownEnv = async() => {
    await compose.stopOne('firestore', { cwd: __dirname, log: true })
}

export const name = 'firestore'
