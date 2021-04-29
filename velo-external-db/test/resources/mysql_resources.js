const mysql = require('mysql');
const { promisify } = require('util');
const compose = require('docker-compose')

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const list = async (pool) => {
    const res = await promisify(pool.query).bind(pool)('SHOW TABLES')
    return res.map(r => Object.values(r)[0])
}
const drop = (table, pool) => promisify(pool.query).bind(pool)(`DROP TABLE ??`, [table])

const cleanup = async (pool) => {
    const tables = await list(pool)
    await Promise.all(tables.map( t => drop(t, pool) ))
}

const initMySqlEnv = async () => {

    process.env.TYPE = 'gcp/sql'
    process.env.HOST = 'localhost'
    process.env.USER = 'test-user'
    process.env.PASSWORD = 'password'
    process.env.DB = 'test-db'

    await compose.upOne('db', { cwd: __dirname, log: true, commandOptions: [['--force-recreate']] } )
    await compose.logs('db', { cwd: __dirname, log: true });

    await sleep( 500 )

    const pool = mysql.createPool({
        host     : 'localhost',
        user     : 'test-user',
        password : 'password',
        database : 'test-db',

        waitForConnections: true,
        namedPlaceholders: true,

        connectionLimit: 10,
        queueLimit: 0
    });

    await cleanup(pool)
    return pool
}

const shutdownMySqlEnv = async () => {
    await compose.stopOne('db', { cwd: __dirname, log: true })
}

module.exports = { initMySqlEnv, shutdownMySqlEnv }