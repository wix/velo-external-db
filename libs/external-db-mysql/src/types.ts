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

export interface MySqlConfig {
    host?: string
    user: string
    password: string
    db: string
    cloudSqlConnectionName?: string
    port?: number
}

export type MySqlQuery = (sql: string, values?: any) => Promise<any>
