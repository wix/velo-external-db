const { Client } = require('pg')


const createDatabase = async(dbName, host, credentials) => {
    const client = new Client({
        host,
        user: credentials.user,
        password: credentials.passwd,
        database: 'postgres',
        port: 5432,
    })
    try {
        await client.connect()
        await client.query(`CREATE DATABASE ${dbName}`)
    } catch (err) {
        console.log('failed to create db')
    } finally {
        await client.end()
    }
}

module.exports = { createDatabase }
