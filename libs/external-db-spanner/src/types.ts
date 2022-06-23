export type SpannerParsedFilter = {
    filterExpr: string,
    parameters: any
}

export type SpannerParsedAggregation = {
    fieldsStatement: string
    groupByColumns: string[]
    havingFilter: string,
    parameters: any[]
}
