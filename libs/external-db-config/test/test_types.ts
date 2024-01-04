
export interface MongoConfig {
    connectionUri?: string
    authorization?: any
    jwtPublicKey?: string
    appDefId?: string
}

export interface MongoAwsConfig {
    URI?: string
    PERMISSIONS?: string
    JWT_PUBLIC_KEY?: string
    APP_DEF_ID?: string
}

export interface MySqlConfig {
    host?: string
    cloudSqlConnectionName?: string
    user?: string
    password?: string
    db?: string
    authorization?: any
    jwtPublicKey?: string
    appDefId?: string
}

export interface AwsMysqlConfig {
    host?: string
    username?: string
    password?: string
    DB?: string
    PERMISSIONS?: string
    JWT_PUBLIC_KEY?: string
    APP_DEF_ID?: string
}

export interface CommonConfig {
    type?: string
    vendor?: string
    hideAppInfo?: boolean
    jwtPublicKey?: string
    appDefId?: string
}

export interface FiresStoreConfig {
    projectId?: string
    authorization?: any
    jwtPublicKey?: string
    appDefId?: string
}

export interface SpannerConfig {
    projectId?: string
    instanceId?: string
    databaseId?: string
    authorization?: any
    jwtPublicKey?: string
    appDefId?: string
}
