export type Field = {
    field: string,
    type: string,
    subtype?: string,
    precision?: number,
    isPrimary?: boolean,
}

export type FieldWithQueryOperators = Field & { queryOperators: string[] }

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
