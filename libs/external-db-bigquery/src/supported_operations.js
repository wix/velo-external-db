const { List, ListHeaders, Create, Drop, AddColumn, RemoveColumn, Describe, FindWithSort, Aggregate, BulkDelete, Truncate, StartWithCaseSensitive, Projection, Matches, NotOperator, IncludeOperator } = require('@wix-velo/velo-external-db-commons').SchemaOperations

const supportedOperations =  [ List, ListHeaders, Create, Drop, AddColumn, RemoveColumn, Describe, FindWithSort, Aggregate, BulkDelete, Truncate, StartWithCaseSensitive, Projection, Matches, NotOperator, IncludeOperator]

module.exports = { supportedOperations }