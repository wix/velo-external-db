export interface postgresConfig  {
    host?: string
    cloudSqlConnectionName?: string
    user: string
    password: string
    db: string
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

