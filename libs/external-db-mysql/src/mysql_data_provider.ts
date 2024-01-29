import { Pool as MySqlPool } from 'mysql'
import { escapeId, escapeTable, patchItem } from './mysql_utils'
import { promisify } from 'util'
import { asParamArrays, updateFieldsFor } from '@wix-velo/velo-external-db-commons'
import { translateErrorCodes } from './sql_exception_translator'
import { wildCardWith } from './mysql_utils'
import { IDataProvider, AdapterFilter as Filter, NonEmptyAdapterAggregation as Aggregation, Item, Sort } from '@wix-velo/velo-external-db-types'
import { IMySqlFilterParser } from './sql_filter_transformer'
import { MySqlQuery } from './types'
import { ILogger } from '@wix-velo/external-db-logger'

export default class DataProvider implements IDataProvider {
    filterParser: IMySqlFilterParser
    pool: MySqlPool
    query: MySqlQuery
    logger?: ILogger
    constructor(pool: any, filterParser: any, logger?: ILogger) {
        this.filterParser = filterParser
        this.pool = pool
        this.logger = logger

        this.query = promisify(this.pool.query).bind(this.pool)
    }

    async find(collectionName: string, filter: Filter, sort: any, skip: any, limit: any, projection: any): Promise<Item[]> {
        const { filterExpr, parameters } = this.filterParser.transform(filter)
        const { sortExpr } = this.filterParser.orderBy(sort)
        const projectionExpr = this.filterParser.selectFieldsFor(projection)
        const sql = `SELECT ${projectionExpr} FROM ${escapeTable(collectionName)} ${filterExpr} ${sortExpr} LIMIT ?, ?`

        this.logger?.debug('mysql-find', { sql, parameters })

        const resultset = await this.query(sql, [...parameters, skip, limit])
                                    .catch( err => translateErrorCodes(err, collectionName) )
        return resultset
    }

    async count(collectionName: string, filter: Filter): Promise<number> {
        const { filterExpr, parameters } = this.filterParser.transform(filter)
        const sql = `SELECT COUNT(*) AS num FROM ${escapeTable(collectionName)} ${filterExpr}`

        this.logger?.debug('mysql-count', { sql, parameters })
        const resultset = await this.query(sql, parameters)
                                    .catch( err => translateErrorCodes(err, collectionName) )
        return resultset[0]['num']
    }

    async insert(collectionName: string, items: Item[], fields: any[], upsert?: boolean): Promise<number> {
        const escapedFieldsNames = fields.map( (f: { field: any }) => escapeId(f.field)).join(', ')
        const op = upsert ? 'REPLACE' : 'INSERT'
        const sql = `${op} INTO ${escapeTable(collectionName)} (${escapedFieldsNames}) VALUES ?`
        
        const data = items.map((item: Item) => asParamArrays( patchItem(item) ) )

        this.logger?.debug('mysql-insert', { sql, parameters: data })

        const resultset = await this.query(sql, [data])
                                    .catch( err => translateErrorCodes(err, collectionName) )
        return resultset.affectedRows
    }

    async update(collectionName: string, items: Item[]): Promise<number> {
        const updateFields = updateFieldsFor(items[0])
        const queries = items.map(() => `UPDATE ${escapeTable(collectionName)} SET ${updateFields.map(f => `${escapeId(f)} = ?`).join(', ')} WHERE _id = ?` )
                             .join(';')
        const updatables: Item[] = items.map((i: Item) => [...updateFields, '_id'].reduce((obj, key) => ({ ...obj, [key]: i[key] }), {}) )
                                .map((u: Item) => asParamArrays( patchItem(u) ))

        this.logger?.debug('mysql-update', { sql: queries, parameters: updatables })
        
        // @ts-ignore
        const resultset = await this.query(queries, [].concat(...updatables))
                                    .catch( err => translateErrorCodes(err, collectionName) )

        return Array.isArray(resultset) ? resultset.reduce((s, r) => s + r.affectedRows, 0) : resultset.affectedRows
    }

    async delete(collectionName: string, itemIds: string[]): Promise<number> {
        const sql = `DELETE FROM ${escapeTable(collectionName)} WHERE _id IN (${wildCardWith(itemIds.length, '?')})`

        this.logger?.debug('mysql-delete', { sql, parameters: itemIds })

        const rs = await this.query(sql, itemIds)
                             .catch( err => translateErrorCodes(err, collectionName) )
        return rs.affectedRows
    }

    async truncate(collectionName: string): Promise<void> {
        const sql = `TRUNCATE ${escapeTable(collectionName)}`
        this.logger?.debug('mysql-truncate', { sql })
        await this.query(`TRUNCATE ${escapeTable(collectionName)}`).catch( err => translateErrorCodes(err, collectionName) )
    }

    async aggregate(collectionName: string, filter: Filter, aggregation: Aggregation, sort: Sort[], skip: number, limit: number): Promise<Item[]> {
        const { filterExpr: whereFilterExpr, parameters: whereParameters } = this.filterParser.transform(filter)
        const { fieldsStatement, groupByColumns, havingFilter, parameters } = this.filterParser.parseAggregation(aggregation)
        const { sortExpr } = this.filterParser.orderBy(sort)

        const sql = `SELECT ${fieldsStatement} FROM ${escapeTable(collectionName)} ${whereFilterExpr} GROUP BY ${groupByColumns.map( escapeId ).join(', ')} ${havingFilter} ${sortExpr} LIMIT ?, ?`
        
        this.logger?.debug('mysql-aggregate', { sql, parameters: [...whereParameters, ...parameters, skip, limit] })
        
        const resultset = await this.query(sql, [...whereParameters, ...parameters, skip, limit])
                                    .catch( err => translateErrorCodes(err, collectionName) )
        return resultset
    }
}
