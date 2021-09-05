const { init } = require('external-db-mysql')
const mysql = require('mysql')
const { runImage, stopImage } = require('./docker_support')

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
    await runImage('mysql')
}

const shutdownEnv = async () => {
    await stopImage('mysql')
}

const setActive = () => {
    process.env.TYPE = 'mysql'
    process.env.HOST = 'localhost'
    process.env.USER = 'test-user'
    process.env.PASSWORD = 'password'
    process.env.DB = 'test-db'
}



module.exports = { initEnv, shutdownEnv, setActive, connection, cleanup }