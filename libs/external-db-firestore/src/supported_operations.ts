import { SchemaOperations } from '@wix-velo/velo-external-db-commons'
const { List, ListHeaders, Create, Drop, AddColumn, RemoveColumn, Describe, BulkDelete, Truncate, DeleteImmediately, UpdateImmediately, StartWithCaseSensitive, FindObject, IncludeOperator } = SchemaOperations

export const supportedOperations =  [ List, ListHeaders, Create, Drop, AddColumn, RemoveColumn, Describe, BulkDelete, Truncate, DeleteImmediately, UpdateImmediately, StartWithCaseSensitive, FindObject, IncludeOperator ]

