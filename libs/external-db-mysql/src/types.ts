export type MySqlParsedFilter = {
    filterExpr: string
    parameters: any[]
}

export type MySqlParsedAggregation = {
    fieldsStatement: string
    groupByColumns: string[]
    havingFilter: string,
    parameters: any[]
}