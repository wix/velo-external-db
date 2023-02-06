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


export interface MSSQLConfig {
    user: string
    password: string
    db: string
    host: string
    unsecuredEnv?: any
    dbPort?: number
    [key: string]: any
}
