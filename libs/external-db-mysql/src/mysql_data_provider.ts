import { Pool as MySqlPool } from 'mysql'
import { escapeId, escapeTable, patchItem } from './mysql_utils'
import { promisify } from 'util'
import { asParamArrays, updateFieldsFor } from '@wix-velo/velo-external-db-commons'
import { translateErrorCodes } from './sql_exception_translator'
import { wildCardWith } from './mysql_utils'
import { IDataProvider, AdapterFilter as Filter, AdapterAggregation as Aggregation, Item} from '@wix-velo/velo-external-db-types'
import { IMySqlFilterParser } from './sql_filter_transformer'
import { MySqlQuery } from './types'

export default class DataProvider implements IDataProvider {
    filterParser: IMySqlFilterParser
    pool: MySqlPool
    query: MySqlQuery
    constructor(pool: any, filterParser: any) {
        this.filterParser = filterParser
        this.pool = pool

        this.query = promisify(this.pool.query).bind(this.pool)
    }

    async find(collectionName: string, filter: Filter, sort: any, skip: any, limit: any, projection: any): Promise<Item[]> {
        const { filterExpr, parameters } = this.filterParser.transform(filter)
        const { sortExpr } = this.filterParser.orderBy(sort)
        const projectionExpr = this.filterParser.selectFieldsFor(projection)
        const sql = `SELECT ${projectionExpr} FROM ${escapeTable(collectionName)} ${filterExpr} ${sortExpr} LIMIT ?, ?`

        const resultset = await this.query(sql, [...parameters, skip, limit])
                                    .catch( translateErrorCodes )
        return resultset
    }

    async count(collectionName: string, filter: Filter): Promise<number> {
        const { filterExpr, parameters } = this.filterParser.transform(filter)
        const sql = `SELECT COUNT(*) AS num FROM ${escapeTable(collectionName)} ${filterExpr}`
        const resultset = await this.query(sql, parameters)
                                    .catch( translateErrorCodes )
        return resultset[0]['num']
    }

    async insert(collectionName: string, items: Item[], fields: any[]): Promise<number> {
        const escapedFieldsNames = fields.map( (f: { field: any }) => escapeId(f.field)).join(', ')
        const sql = `INSERT INTO ${escapeTable(collectionName)} (${escapedFieldsNames}) VALUES ?`
        
        const data = items.map((item: Item) => asParamArrays( patchItem(item) ) )
        const resultset = await this.query(sql, [data])
                                    .catch( translateErrorCodes )
        return resultset.affectedRows
    }

    async update(collectionName: string, items: Item[]): Promise<number> {
        const updateFields = updateFieldsFor(items[0])
        const queries = items.map(() => `UPDATE ${escapeTable(collectionName)} SET ${updateFields.map(f => `${escapeId(f)} = ?`).join(', ')} WHERE _id = ?` )
                             .join(';')
        const updatables: Item[] = items.map((i: Item) => [...updateFields, '_id'].reduce((obj, key) => ({ ...obj, [key]: i[key] }), {}) )
                                .map((u: Item) => asParamArrays( patchItem(u) ))
        
        // @ts-ignore - why not just updatables
        const resultset = await this.query(queries, [].concat(...updatables))
                                    .catch( translateErrorCodes )

        return Array.isArray(resultset) ? resultset.reduce((s, r) => s + r.changedRows, 0) : resultset.changedRows
    }

    async delete(collectionName: string, itemIds: string[]): Promise<number> {
        const sql = `DELETE FROM ${escapeTable(collectionName)} WHERE _id IN (${wildCardWith(itemIds.length, '?')})`
        const rs = await this.query(sql, itemIds)
                             .catch( translateErrorCodes )
        return rs.affectedRows
    }

    async truncate(collectionName: string): Promise<void> {
        await this.query(`TRUNCATE ${escapeTable(collectionName)}`).catch( translateErrorCodes )
    }

    async aggregate(collectionName: string, filter: Filter, aggregation: Aggregation): Promise<Item[]> {
        const { filterExpr: whereFilterExpr, parameters: whereParameters } = this.filterParser.transform(filter)
        const { fieldsStatement, groupByColumns, havingFilter, parameters } = this.filterParser.parseAggregation(aggregation)

        const sql = `SELECT ${fieldsStatement} FROM ${escapeTable(collectionName)} ${whereFilterExpr} GROUP BY ${groupByColumns.map( escapeId ).join(', ')} ${havingFilter}`
        const resultset = await this.query(sql, [...whereParameters, ...parameters])
                                    .catch( translateErrorCodes )
        return resultset
    }
}
