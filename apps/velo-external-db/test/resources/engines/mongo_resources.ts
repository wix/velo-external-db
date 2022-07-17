import { init } from '@wix-velo/external-db-mongo'
import { runImage, stopImage } from './docker_support'
export { supportedOperations } from '@wix-velo/external-db-mongo'

export const connection = async() => {
    const { connection, schemaProvider, cleanup } = await init({ connectionUri: 'mongodb://root:pass@localhost/testdb' })

    return { pool: connection, schemaProvider, cleanup: cleanup }
}

export const cleanup = async() => {
    const { schemaProvider, cleanup } = await init({ connectionUri: 'mongodb://root:pass@localhost/testdb' })

    const tables = await schemaProvider.list()
    await Promise.all(tables.map(t => t.id).map( t => schemaProvider.drop(t) ))

    await cleanup()
}

export const initEnv = async() => {
    await runImage('mongo')
}

export const shutdownEnv = async() => {
    await stopImage('mongo')
}

export const setActive = () => {
    process.env.TYPE = 'mongo'
    process.env.URI = 'mongodb://root:pass@localhost/testdb'
}
