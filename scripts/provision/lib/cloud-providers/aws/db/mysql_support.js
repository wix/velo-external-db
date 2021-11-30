const mysql = require('mysql')


const createDatabase = async(dbName, host, credentials) => {
    let connection

    try {
        connection = mysql.createConnection({
            host: host,
            user: credentials.user,
            password: credentials.passwd,
        })
        connection.connect()
        connection.query(`CREATE DATABASE ${dbName}`)
    } catch (err) {
        console.error(err)
    } finally {
        if (connection) {
            connection.end()
        }
    }
}

module.exports = { createDatabase }