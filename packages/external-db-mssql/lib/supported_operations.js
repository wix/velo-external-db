const { List, ListHeaders, Create, Drop, AddColumn, RemoveColumn, Describe, FindWithSort, Aggregate, BulkDelete, 
        Truncate, UpdateImmediately, DeleteImmediately, StartWithCaseSensitive, StartWithCaseInsensitive, Projection, NotOperator, Matches } = require('velo-external-db-commons').SchemaOperations

const supportedOperations =  [ List, ListHeaders, Create, Drop, AddColumn, RemoveColumn, Describe, FindWithSort, Aggregate, BulkDelete, Truncate, UpdateImmediately, DeleteImmediately, StartWithCaseSensitive, StartWithCaseInsensitive, Projection, NotOperator, Matches ]

module.exports = { supportedOperations }