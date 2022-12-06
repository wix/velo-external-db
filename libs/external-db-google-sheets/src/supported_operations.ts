import { SchemaOperations } from '@wix-velo/velo-external-db-types'

const { List, ListHeaders, Create, Drop, AddColumn, Describe, Projection } = SchemaOperations

export const supportedOperations =  [ List, ListHeaders, Create, Drop, AddColumn, Describe, Projection ]
