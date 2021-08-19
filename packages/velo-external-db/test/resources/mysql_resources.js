const { init } = require('external-db-mysql')
const compose = require('docker-compose')
const mysql = require('mysql')
const { sleep } = require("test-commons")

const connection = () => {
    const pool = mysql.createPool({
        host     : 'localhost',
        user     : 'test-user',
        password : 'password',
        database : 'test-db',

        waitForConnections: true,
        namedPlaceholders: true,
        multipleStatements: true,

        connectionLimit: 1,
        queueLimit: 0
    });
    return { pool, cleanup: async () => await pool.end(() => {})}
}

const cleanup = async () => {
    const {schemaProvider, cleanup} = init(['localhost', 'test-user', 'password', 'test-db'])
    const tables = await schemaProvider.list()
    await Promise.all(tables.map(t => t.id).map( t => schemaProvider.drop(t) ))

    await cleanup();
}

const initEnv = async () => {
    await compose.upOne('mysql', { cwd: __dirname, log: true, commandOptions: [['--force-recreate', '--remove-orphans']] } )

    await sleep( 500 )

    await cleanup()
}

const shutdownEnv = async () => {
    await compose.stopOne('mysql', { cwd: __dirname })
}

const setActive = () => {
    process.env.TYPE = 'mysql'
    process.env.HOST = 'localhost'
    process.env.USER = 'test-user'
    process.env.PASSWORD = 'password'
    process.env.DB = 'test-db'
}



module.exports = { initEnv, shutdownEnv, setActive, connection, cleanup }