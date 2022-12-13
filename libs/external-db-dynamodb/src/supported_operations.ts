import { SchemaOperations } from '@wix-velo/velo-external-db-types'
const { List, ListHeaders, Create, Drop, AddColumn, RemoveColumn, Describe, BulkDelete, Truncate, DeleteImmediately, UpdateImmediately, Projection, StartWithCaseSensitive, NotOperator, FindObject, IncludeOperator, FilterByEveryField } = SchemaOperations

export const supportedOperations =  [ List, ListHeaders, Create, Drop, AddColumn, RemoveColumn, Describe, BulkDelete, Truncate, DeleteImmediately, UpdateImmediately, Projection, StartWithCaseSensitive, NotOperator, FindObject, IncludeOperator, FilterByEveryField ]
