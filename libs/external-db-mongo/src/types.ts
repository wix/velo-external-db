import { AnyFixMe } from '@wix-velo/velo-external-db-types'

export type MongoFilter = {
    [key: string]: AnyFixMe
}

export type MongoAggregation = {
    fieldsStatement: AnyFixMe,
    havingFilter: { $match: MongoFilter }
}

export type MongoFieldSort = [string, 'asc' | 'desc'] 

export type MongoSort = { sort: MongoFieldSort[] }

export type MongoProjection = {
    [key: string]: 1 | 0
}
