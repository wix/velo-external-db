import { SchemaOperations } from '@wix-velo/velo-external-db-commons'

const { List, ListHeaders, Create, Drop, AddColumn, Describe } = SchemaOperations

export const supportedOperations =  [ List, ListHeaders, Create, Drop, AddColumn, Describe ]