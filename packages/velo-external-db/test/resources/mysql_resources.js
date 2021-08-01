const mysql = require('mysql')
const { promisify } = require('util')
const compose = require('docker-compose')

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connection = () => {
    return mysql.createPool({
        host     : 'localhost',
        user     : 'test-user',
        password : 'password',
        database : 'test-db',

        waitForConnections: true,
        namedPlaceholders: true,
        multipleStatements: true,

        connectionLimit: 10,
        queueLimit: 0
    });
}

const list = async (pool) => {
    const res = await promisify(pool.query).bind(pool)('SHOW TABLES')
    return res.map(r => Object.values(r)[0])
}
const drop = (table, pool) => promisify(pool.query).bind(pool)(`DROP TABLE ??`, [table])

const cleanup = async () => {

    const conn = connection()

    const tables = await list(conn)
    await Promise.all(tables.map( t => drop(t, conn) ))

    await conn.end();
}

const initEnv = async () => {
    await compose.upOne('mysql', { cwd: __dirname, log: true, commandOptions: [['--force-recreate', '--remove-orphans']] } )
    // await compose.logs('db', { cwd: __dirname, log: true });

    await sleep( 500 )

    await cleanup()
}

const shutdownEnv = async () => {
    await compose.stopOne('mysql', { cwd: __dirname, log: true })
}

const setActive = () => {
    process.env.TYPE = 'sql/mysql'
    process.env.HOST = 'localhost'
    process.env.USER = 'test-user'
    process.env.PASSWORD = 'password'
    process.env.DB = 'test-db'
}



module.exports = { initEnv, shutdownEnv, setActive, connection, cleanup }