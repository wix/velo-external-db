
export interface MongoConfig {
    connectionUri?: string
    externalDatabaseId?: string
    allowedMetasites?: string
    authorization?: any
}

export interface MongoAwsConfig {
    URI?: string
    EXTERNAL_DATABASE_ID?: string
    ALLOWED_METASITES?: string
    PERMISSIONS?: string
}

export interface MySqlConfig {
    host?: string
    cloudSqlConnectionName?: string
    user?: string
    password?: string
    db?: string
    externalDatabaseId?: string
    allowedMetasites?: string
    authorization?: any
    auth?: any
}

export interface AwsMysqlConfig {
    host?: string
    username?: string
    password?: string
    DB?: string
    EXTERNAL_DATABASE_ID?: string
    ALLOWED_METASITES?: string
    PERMISSIONS?: string
}

export interface CommonConfig {
    type?: string
    vendor?: string
    secretKey?: string
    hideAppInfo?: boolean
    externalDatabaseId?: string
    allowedMetasites?: string
}

export interface FiresStoreConfig {
    projectId?: string
    externalDatabaseId?: string
    allowedMetasites?: string
    authorization?: any
    auth?: any
}

export interface SpannerConfig {
    projectId?: string
    instanceId?: string
    databaseId?: string
    externalDatabaseId?: string
    allowedMetasites?: string
    authorization?: any
    auth?: any
}
