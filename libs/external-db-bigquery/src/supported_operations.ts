import { SchemaOperations } from '@wix-velo/velo-external-db-commons'
const { List, ListHeaders, Create, Drop, AddColumn, RemoveColumn, Describe, FindWithSort, Aggregate, BulkDelete, Truncate, StartWithCaseSensitive, Projection, Matches, NotOperator, IncludeOperator } = SchemaOperations

export const supportedOperations =  [ List, ListHeaders, Create, Drop, AddColumn, RemoveColumn, Describe, FindWithSort, Aggregate, BulkDelete, Truncate, StartWithCaseSensitive, Projection, Matches, NotOperator, IncludeOperator]
