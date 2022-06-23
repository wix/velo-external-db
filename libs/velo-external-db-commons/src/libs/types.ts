import { ResponseField } from "@wix-velo/velo-external-db-types"

export type Field = {
    field: string,
    type: string,
    subtype?: string,
    precision?: number,
    isPrimary?: boolean,
}

export type FieldWithQueryOperators = ResponseField & { queryOperators: string[] }

export interface AsWixSchemaHeaders {
    id: string,
    displayName: string,
    maxPageSize: number,
    ttl: number
}

export interface AsWixSchema extends AsWixSchemaHeaders {
    allowedOperations: string[],
    allowedSchemaOperations: string[],
    fields: { [field: string]: FieldWithQueryOperators }
}
