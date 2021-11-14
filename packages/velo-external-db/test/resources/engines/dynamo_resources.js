const { init } = require('external-db-dynamo')
const { runImage, stopImage } = require('./docker_support')

const connection = async() => {
    const { connection, cleanup } = await init(connectionConfig(), accessOptions())

    return { pool: connection, cleanup: cleanup }
}

const cleanup = async() => {
    const { schemaProvider, cleanup } = await init(connectionConfig(), accessOptions())
    const tables = await schemaProvider.list()
    await Promise.all(tables.map(t => t.id).map(t => schemaProvider.drop(t)))
    await cleanup()
}

const initEnv = async() => {
    await runImage('dynamodb')
}

const shutdownEnv = async() => {
    await stopImage('dynamodb')
}

const setActive = () => {
    process.env.TYPE = 'dynamo'
    process.env.REGION = 'us-west-2'
    process.env.AWS_SECRET_ACCESS_KEY = 'VELOACCESSKEY'
    process.env.AWS_ACCESS_KEY_ID = 'VELOKEYID'
    process.env.ENDPOINT_URL = 'http://localhost:8000'
}

const connectionConfig = () => ({ endpoint: 'http://localhost:8000',
                                  region: 'us-west-2',
                               })
const accessOptions = () => ({
                                credentials: { accessKeyId: 'VELOKEYID', secretAccessKey: 'VELOACCESSKEY' }
                            })

module.exports = { initEnv, shutdownEnv, setActive, connection, cleanup }