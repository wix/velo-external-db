
export interface MongoConfig {
    connectionUri?: string
    secretKey?: string
    authorization?: any
}

export interface MongoAwsConfig {
    URI?: string
    SECRET_KEY?: string
    PERMISSIONS?: string
}

export interface MySqlConfig {
    host?: string
    cloudSqlConnectionName?: string
    user?: string
    password?: string
    db?: string
    secretKey?: string
    authorization?: any
    auth?: any
}

export interface AwsMysqlConfig {
    host?: string
    username?: string
    password?: string
    DB?: string
    SECRET_KEY?: string
    PERMISSIONS?: string
}

export interface CommonConfig {
    type?: string
    vendor?: string
    secretKey?: string
}

export interface FiresStoreConfig {
    projectId?: string
    secretKey?: string
    authorization?: any
    auth?: any
}

export interface SpannerConfig {
    projectId?: string
    instanceId?: string
    databaseId?: string
    secretKey?: string
    authorization?: any
    auth?: any
}