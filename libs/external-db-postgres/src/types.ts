export interface PostgresConfig  {
    host?: string
    cloudSqlConnectionName?: string
    user: string
    password: string
    db: string
    dbPort?: number
}

export interface postgresPoolOptions {
    [x:string]: any
}

export type ParsedFilter = {
    filterExpr?: string,
    filterColumns: [],
    parameters: any[],
    offset: number,
}

