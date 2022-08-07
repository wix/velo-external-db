const { SchemaOperations } = require('@wix-velo/velo-external-db-types')

const { List, ListHeaders, Create, Drop, AddColumn, Describe } = SchemaOperations

const supportedOperations =  [ List, ListHeaders, Create, Drop, AddColumn, Describe ]

module.exports = { supportedOperations }