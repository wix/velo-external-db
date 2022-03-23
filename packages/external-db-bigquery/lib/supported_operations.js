const { List, ListHeaders, Create, Drop, AddColumn, RemoveColumn, Describe, FindWithSort, Aggregate, BulkDelete, Truncate, StartWithCaseSensitive, Projection } = require('velo-external-db-commons').SchemaOperations

const supportedOperations =  [ List, ListHeaders, Create, Drop, AddColumn, RemoveColumn, Describe, FindWithSort, Aggregate, BulkDelete, Truncate, StartWithCaseSensitive, Projection ]

module.exports = { supportedOperations }