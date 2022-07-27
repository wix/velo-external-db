import { init } from '@wix-velo/external-db-spanner'
export { supportedOperations } from '@wix-velo/external-db-spanner'
import * as compose from 'docker-compose'

const setEmulatorOn = () => process.env['SPANNER_EMULATOR_HOST'] = 'localhost:9010'

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
    await compose.upOne('spanner', { cwd: __dirname, log: true, commandOptions: [['--force-recreate', '--remove-orphans']] })
}

export const setActive = () => {
    setEmulatorOn()
    process.env['TYPE'] = 'spanner'
    process.env['PROJECT_ID'] = 'test-project'
    process.env['INSTANCE_ID'] = 'test-instance'
    process.env['DATABASE_ID'] = 'test-database'
}

export const shutdownEnv = async() => {
    await compose.stopOne('spanner', { cwd: __dirname, log: true })
}

export const name = 'spanner'
