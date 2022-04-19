const { List, ListHeaders, Create, Drop, AddColumn, RemoveColumn, Describe, BulkDelete, Truncate, DeleteImmediately, UpdateImmediately, StartWithCaseSensitive, FindObject } = require('velo-external-db-commons').SchemaOperations

const supportedOperations =  [ List, ListHeaders, Create, Drop, AddColumn, RemoveColumn, Describe, BulkDelete, Truncate, DeleteImmediately, UpdateImmediately, StartWithCaseSensitive, FindObject ]

module.exports = { supportedOperations }