type Field = {
    field: string,
    type: string,
    subtype?: string,
    precision?: number,
    isPrimary?: boolean,
}

type FieldWithQueryOperators = Field & { queryOperators: string[] }

interface asWixSchemaHeaders {
    id: string,
    displayName: string,
    maxPageSize: number,
    ttl: number
}

interface AsWixSchema extends asWixSchemaHeaders {
    allowedOperations: string[],
    allowedSchemaOperations: string[],
    fields: { [field: string]: FieldWithQueryOperators }
}

export { Field, FieldWithQueryOperators, asWixSchemaHeaders, AsWixSchema }