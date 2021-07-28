const compose = require('docker-compose')
const { Pool, types } = require('pg')
const { builtins } = require('pg-types')

// make postgres driver parse numbers
types.setTypeParser(builtins.NUMERIC, val => parseFloat(val))

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const list = async (pool) => {
    const res = await pool.query('SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname != $1 AND schemaname != $2', ['pg_catalog', 'information_schema'])
    return res.rows.map(r => Object.values(r)[0])
}
const drop = (table, pool) => pool.query(`DROP TABLE "${table}"`)

const cleanup = async (pool) => {
    const tables = await list(pool)
    await Promise.all(tables.map( t => drop(t, pool) ))
}

const initEnv = async () => {

    await compose.upOne('postgres', { cwd: __dirname, log: true, commandOptions: [['--force-recreate', '--remove-orphans']] } )

    await sleep( 500 )

    const pool = new Pool({
        host: 'localhost',
        user: 'test-user',
        password: 'password',
        database: 'test-db',
    })

    await cleanup(pool)
    return pool
}

const shutdownEnv = async () => {
    await compose.stopOne('postgres', { cwd: __dirname, log: true })
}

module.exports = { initEnv, shutdownEnv }