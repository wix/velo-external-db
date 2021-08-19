const compose = require('docker-compose')
const { types, Pool} = require('pg')
const { builtins } = require('pg-types')
const { init } = require('external-db-postgres')
const { sleep } = require("test-commons")

// make postgres driver parse numbers
types.setTypeParser(builtins.NUMERIC, val => parseFloat(val))

const connection = () => {
    const pool = new Pool({
        host: 'localhost',
        user: 'test-user',
        password: 'password',
        database: 'test-db',
        port: 5432,

        max: 1,
        idleTimeoutMillis: 1000,
        connectionTimeoutMillis: 2000,
    })
    return { pool, cleanup: async () => await pool.end(() => {})}
}

const cleanup = async () => {
    const {schemaProvider, cleanup} = init(['localhost', 'test-user', 'password', 'test-db'])
    const tables = await schemaProvider.list()
    await Promise.all(tables.map(t => t.id).map( t => schemaProvider.drop(t) ))

    await cleanup();
}

const initEnv = async () => {

    await compose.upOne('postgres', { cwd: __dirname, log: true, commandOptions: [['--force-recreate', '--remove-orphans']] } )

    await sleep( 500 )

    await cleanup()
}

const setActive = () => {
    process.env.TYPE = 'postgres'
    process.env.HOST = 'localhost'
    process.env.USER = 'test-user'
    process.env.PASSWORD = 'password'
    process.env.DB = 'test-db'
}

const shutdownEnv = async () => {
    await compose.stopOne('postgres', { cwd: __dirname })
}

module.exports = { initEnv, shutdownEnv, setActive, connection, cleanup }