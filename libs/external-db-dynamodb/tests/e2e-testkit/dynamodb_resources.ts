import init from '../../src/connection_provider'
export { supportedOperations } from '../../src/supported_operations'
import * as compose from 'docker-compose'

export const connection = async() => {
    const { connection, schemaProvider, cleanup } = init(connectionConfig(), accessOptions())

    return { pool: connection, schemaProvider, cleanup: cleanup }
}

export const cleanup = async() => {
    const { schemaProvider, cleanup } = init(connectionConfig(), accessOptions())
    const tables = await schemaProvider.list()
    await Promise.all(tables.map(t => t.id).map(t => schemaProvider.drop(t)))
    await cleanup()
}

export const initEnv = async() => {
    await compose.upOne('dynamodb', { cwd: __dirname, log: true, commandOptions: [['--force-recreate', '--remove-orphans']] })
}

export const shutdownEnv = async() => {
    await compose.stopOne('dynamodb', { cwd: __dirname, log: true })
}

export const setActive = () => {
    process.env['TYPE'] = 'dynamodb'
    process.env['REGION'] = 'us-west-2'
    process.env['AWS_SECRET_ACCESS_KEY'] = 'TEST_SECRET_ACCESS_KEY'
    process.env['AWS_ACCESS_KEY_ID'] = 'TEST_ACCESS_KEY_ID'
    process.env['ENDPOINT_URL'] = 'http://localhost:8000'
}

const connectionConfig = () => ({ endpoint: 'http://localhost:8000',
                                  region: 'us-west-2',
                               })
const accessOptions = () => ({
                                credentials: { accessKeyId: 'TEST_ACCESS_KEY_ID', secretAccessKey: 'TEST_SECRET_ACCESS_KEY' }
                            })

export const name = 'dynamodb'