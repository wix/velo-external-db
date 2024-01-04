import * as compose from 'docker-compose'
import init from '../../src/connection_provider'
export { supportedOperations } from '../../src/supported_operations'

export * as capabilities from '../../src/spanner_capabilities' 

const setEmulatorOn = () => process.env['SPANNER_EMULATOR_HOST'] = 'localhost:9010'

export const connection = () => {
    const { connection, schemaProvider, cleanup } = init({ projectId: 'test-project', instanceId: 'test-instance', databaseId: 'test-database' })
    return { pool: connection, schemaProvider, cleanup }
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
    process.env = { ...process.env, ...enviormentVariables }
}

export const enviormentVariables = {
    TYPE: 'spanner',
    PROJECT_ID: 'test-project',
    INSTANCE_ID: 'test-instance',
    DATABASE_ID: 'test-database'
}

export const shutdownEnv = async() => {
    await compose.stopOne('spanner', { cwd: __dirname, log: true })
}

export const name = 'spanner'
