export type MSSQLParsedFilter = {
    filterExpr: string,
    parameters: any
}

export type MSSQLParsedAggregation = {
    fieldsStatement: string
    groupByColumns: string[]
    havingFilter: string,
    parameters: any[]
}
