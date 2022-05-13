const { SchemaOperations } = require('velo-external-db-commons')

const { List, ListHeaders, Create, Drop, AddColumn, Describe, NotOperator } = SchemaOperations

const supportedOperations =  [ List, ListHeaders, Create, Drop, AddColumn, Describe, NotOperator ]

module.exports = { supportedOperations }