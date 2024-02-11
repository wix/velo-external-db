import { Pool } from 'pg'
import { escapeIdentifier, prepareStatementVariables, prepareStatementVariablesForBulkInsert } from './postgres_utils'
import { asParamArrays, patchDateTime, updateFieldsFor } from '@wix-velo/velo-external-db-commons'
import { translateErrorCodes } from './sql_exception_translator'
import { IDataProvider, AdapterFilter as Filter, Sort, Item, NonEmptyAdapterAggregation as Aggregation, ResponseField } from '@wix-velo/velo-external-db-types'
import FilterParser from './sql_filter_transformer'
import { ILogger } from '@wix-velo/external-db-logger'

export default class DataProvider implements IDataProvider {
    pool: Pool
    filterParser: FilterParser
    logger?: ILogger

    public constructor(pool: Pool, filterParser: FilterParser, logger?: ILogger) {
        this.filterParser = filterParser
        this.pool = pool
        this.logger = logger
    }

    async find(collectionName: string, filter: Filter, sort: Sort[], skip: number, limit: number, projection: string[]): Promise<Item[]> {
        const { filterExpr, parameters, offset } = this.filterParser.transform(filter)
        const { sortExpr } = this.filterParser.orderBy(sort)
        const projectionExpr = this.filterParser.selectFieldsFor(projection)
        const sql = `SELECT ${projectionExpr} FROM ${escapeIdentifier(collectionName)} ${filterExpr} ${sortExpr} OFFSET $${offset} LIMIT $${offset + 1}`
        
        this.logger?.debug('postgres-find', { sql, parameters })

        const resultSet = await this.pool.query(sql, [...parameters, skip, limit])
                                    .catch( err => translateErrorCodes(err, collectionName) )
        return resultSet.rows
    }

    async count(collectionName: string, filter: Filter) {
        const { filterExpr, parameters } = this.filterParser.transform(filter)
        const sql = `SELECT COUNT(*) AS num FROM ${escapeIdentifier(collectionName)} ${filterExpr}`

        this.logger?.debug('postgres-count', { sql, parameters })

        const resultSet = await this.pool.query(sql, parameters)
                                         .catch( err => translateErrorCodes(err, collectionName) )
        return parseInt(resultSet.rows[0]['num'], 10)
    }

    async insert(collectionName: string, items: Item[], fields: ResponseField[], upsert?: boolean) {
        const itemsAsParams = items.map((item: Item) => asParamArrays( patchDateTime(item) ))
        const escapedFieldsNames = fields.map( (f: { field: string }) => escapeIdentifier(f.field)).join(', ')
        const upsertAddon = upsert ? ` ON CONFLICT (_id) DO UPDATE SET ${fields.map(f => `${escapeIdentifier(f.field)} = EXCLUDED.${escapeIdentifier(f.field)}`).join(', ')}` : ''
        const query = `INSERT INTO ${escapeIdentifier(collectionName)} (${escapedFieldsNames}) VALUES ${prepareStatementVariablesForBulkInsert(items.length, fields.length)}${upsertAddon}`

        this.logger?.debug('postgres-insert', { query, parameters: itemsAsParams.flat() })
        
        await this.pool.query(query, itemsAsParams.flat()).catch( err => translateErrorCodes(err, collectionName) )

        return items.length
    }

    async update(collectionName: string, items: Item[]): Promise<number> {
        const updateFields = updateFieldsFor(items[0])
        const updatables = items.map((i: { [x: string]: any }) => [...updateFields, '_id'].reduce((obj, key) => ({ ...obj, [key]: i[key] }), {}) )
                                .map((u: { [x: string]: any }) => asParamArrays( patchDateTime(u) ))
        
        const res = await Promise.all(
                        updatables.map(async(updatable: any) => {
                                const sql = `UPDATE ${escapeIdentifier(collectionName)} SET ${updateFields.map((f, i) => `${escapeIdentifier(f)} = $${i + 1}`).join(', ')} WHERE _id = $${updateFields.length + 1}`
                                this.logger?.debug('postgres-update', { sql, parameters: updatable })
                                const rs = await this.pool.query(sql, updatable)
                                                          .catch( err => translateErrorCodes(err, collectionName) )
                                return rs.rowCount
                        } ) )
        
        // @ts-ignore
        return res.reduce((sum: number, i: number) => i + sum, 0)
    }

    async delete(collectionName: string, itemIds: string[]): Promise<number> {
        const sql = `DELETE FROM ${escapeIdentifier(collectionName)} WHERE _id IN (${prepareStatementVariables(itemIds.length)})`
        this.logger?.debug('postgres-delete', { sql, parameters: itemIds })
        const rs = await this.pool.query(sql, itemIds)
                             .catch( err => translateErrorCodes(err, collectionName) )
        
        // @ts-ignore
        return rs.rowCount
    }

    async truncate(collectionName: string) {
        const sql = `TRUNCATE ${escapeIdentifier(collectionName)}`
        this.logger?.debug('postgres-truncate', { sql })
        await this.pool.query(sql).catch( err => translateErrorCodes(err, collectionName) )
    }

    async aggregate(collectionName: string, filter: Filter, aggregation: Aggregation, sort: Sort[], skip: number, limit: number): Promise<Item[]> {

        const { filterExpr: whereFilterExpr, parameters: whereParameters, offset } = this.filterParser.transform(filter)
        const { fieldsStatement, groupByColumns, havingFilter: filterExpr, parameters: havingParameters, offset: offsetAfterAggregation } = this.filterParser.parseAggregation(aggregation, offset)
        const { sortExpr } = this.filterParser.orderBy(sort)

        const sql = `SELECT ${fieldsStatement} FROM ${escapeIdentifier(collectionName)} ${whereFilterExpr} GROUP BY ${groupByColumns.map( escapeIdentifier ).join(', ')} ${filterExpr} ${sortExpr} OFFSET $${offsetAfterAggregation} LIMIT $${offsetAfterAggregation+1}`
        this.logger?.debug('postgres-aggregate', { sql, parameters: [...whereParameters, ...havingParameters, skip, limit] })
        const rs = await this.pool.query(sql, [...whereParameters, ...havingParameters, skip, limit])
                                  .catch( err => translateErrorCodes(err, collectionName) )
        return rs.rows
    }
}

