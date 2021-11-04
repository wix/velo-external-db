const sql = require('mssql')

const createDatabase = async (dbName, host, credentials) => {
    const config = {
        user: credentials.user,
        password: credentials.password,
        server: host,
        port: 1433,
        options: {
            encrypt: false,
            trustServerCertificate: true
        }

    }

    try {
        await sql.connect(config)
        await sql.query(`CREATE DATABASE ${dbName}`)
    } catch (err) {
        console.error(err)
    } finally {
        await sql.close()
    }
}

module.exports = { createDatabase }