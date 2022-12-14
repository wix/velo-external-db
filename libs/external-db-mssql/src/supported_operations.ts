import { SchemaOperations } from '@wix-velo/velo-external-db-types'
const { List, ListHeaders, Create, Drop, AddColumn, RemoveColumn, Describe, FindWithSort, Aggregate, BulkDelete, 
        Truncate, UpdateImmediately, DeleteImmediately, StartWithCaseSensitive, StartWithCaseInsensitive, Projection, NotOperator, Matches, IncludeOperator, FilterByEveryField } = SchemaOperations

export const supportedOperations = [ List, ListHeaders, Create, Drop, AddColumn, RemoveColumn, Describe, FindWithSort, Aggregate, BulkDelete, Truncate, UpdateImmediately, DeleteImmediately, StartWithCaseSensitive, StartWithCaseInsensitive, Projection, NotOperator, Matches, IncludeOperator, FilterByEveryField ]
