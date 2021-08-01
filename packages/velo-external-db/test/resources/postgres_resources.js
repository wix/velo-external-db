const compose = require('docker-compose')
const { types, Pool} = require('pg')
const { builtins } = require('pg-types')

// make postgres driver parse numbers
types.setTypeParser(builtins.NUMERIC, val => parseFloat(val))

const connection = () => {
    return new Pool({
        host: 'localhost',
        user: 'test-user',
        password: 'password',
        database: 'test-db',
        port: 5432,

        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    })
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const list = async (pool) => {
    const res = await pool.query('SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname != $1 AND schemaname != $2', ['pg_catalog', 'information_schema'])
    return res.rows.map(r => Object.values(r)[0])
}
const drop = (table, pool) => pool.query(`DROP TABLE "${table}"`)

const cleanup = async () => {
    const client = connection()
    const tables = await list(client)
    await Promise.all(tables.map( t => drop(t, client) ))

    await client.end()
}

const initEnv = async () => {

    await compose.upOne('postgres', { cwd: __dirname, log: true, commandOptions: [['--force-recreate', '--remove-orphans']] } )

    await sleep( 500 )

    await cleanup()
}

const setActive = () => {
    process.env.TYPE = 'sql/postgres'
    process.env.HOST = 'localhost'
    process.env.USER = 'test-user'
    process.env.PASSWORD = 'password'
    process.env.DB = 'test-db'

}

const shutdownEnv = async () => {
    await compose.stopOne('postgres', { cwd: __dirname, log: true })
}

module.exports = { initEnv, shutdownEnv, setActive, connection }