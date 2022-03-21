const { SchemaOperations } = require('velo-external-db-commons')

const { List, ListHeaders, Create, Drop, AddColumn, Describe } = SchemaOperations

const supportedOperations =  [ List, ListHeaders, Create, Drop, AddColumn, Describe ]

module.exports = { supportedOperations }