const { init } = require('external-db-mysql')
const compose = require('docker-compose')
const mysql = require('mysql')

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

const cleanup = async () => {
    const {schemaProvider, cleanup} = init(['localhost', 'test-user', 'password', 'test-db'])
    const tables = await schemaProvider.list()
    await Promise.all(tables.map(t => t.id).map( t => schemaProvider.drop(t) ))

    await cleanup();
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
    process.env.PORT = 8080
}



module.exports = { initEnv, shutdownEnv, setActive, connection, cleanup }