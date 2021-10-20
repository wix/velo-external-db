const mysql = require('external-db-mysql')
const init = require('./connection_provider')

module.exports = { ...mysql, init }
