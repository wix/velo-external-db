const { init } = require('external-db-mssql')
const compose = require('docker-compose')
const sql = require('mssql')
const { sleep } = require('test-commons')

const connection = async () => {
    const sqlConfig = {
        user: 'sa',
        password: 't9D4:EHfU6Xgccs-',
        database: 'tempdb',
        server: 'localhost',
        port: 1433,
        pool: {
            max: 1,
            min: 0,
            idleTimeoutMillis: 30000
        },
        options: {
            // encrypt: true, // for azure
            trustServerCertificate: true // change to true for local dev / self-signed certs
        }
    }

    const pool = await sql.connect(sqlConfig)
    return { pool: pool, cleanup: async () => await pool.close()}
}

const cleanup = async () => {
    const {schemaProvider, cleanup} = await init(['localhost', 'sa', 't9D4:EHfU6Xgccs-', 'tempdb'])

    const tables = await schemaProvider.list()
    await Promise.all(tables.map(t => t.id).map( t => schemaProvider.drop(t) ))

    await cleanup();
}

const initEnv = async () => {
    await compose.upOne('mssql', { cwd: __dirname, log: true, commandOptions: [['--force-recreate', '--remove-orphans']] } )

    // await sleep( 5000 )
    //
    // await cleanup()
}

const shutdownEnv = async () => {
    await compose.stopOne('mssql', { cwd: __dirname })
}

const setActive = () => {
    process.env.TYPE = 'mssql'
    process.env.HOST = 'localhost'
    process.env.USER = 'sa'
    process.env.PASSWORD = 't9D4:EHfU6Xgccs-'
    process.env.DB = 'tempdb'
}



module.exports = { initEnv, shutdownEnv, setActive, connection, cleanup }