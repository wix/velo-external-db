import { Pool } from 'pg'
import { escapeIdentifier, prepareStatementVariables, prepareStatementVariablesForBulkInsert } from './postgres_utils'
import { asParamArrays, patchDateTime, updateFieldsFor } from '@wix-velo/velo-external-db-commons'
import { translateErrorCodes } from './sql_exception_translator'
import { IDataProvider, AdapterFilter as Filter, Sort, Item, AdapterAggregation as Aggregation, ResponseField } from '@wix-velo/velo-external-db-types'
import FilterParser from './sql_filter_transformer'

export default class DataProvider implements IDataProvider {
    pool: Pool
    filterParser: FilterParser

    public constructor(pool: Pool, filterParser: FilterParser) {
        this.filterParser = filterParser
        this.pool = pool
    }

    async find(collectionName: string, filter: Filter, sort: Sort[], skip: number, limit: number, projection: string[]): Promise<Item[]> {
        const { filterExpr, parameters, offset } = this.filterParser.transform(filter)
        const { sortExpr } = this.filterParser.orderBy(sort)
        const projectionExpr = this.filterParser.selectFieldsFor(projection)
        const sql = `SELECT ${projectionExpr} FROM ${escapeIdentifier(collectionName)} ${filterExpr} ${sortExpr} OFFSET $${offset} LIMIT $${offset + 1}`
        const resultSet = await this.pool.query(sql, [...parameters, skip, limit])
                                    .catch( translateErrorCodes )
        return resultSet.rows
    }

    async count(collectionName: string, filter: Filter) {
        const { filterExpr, parameters } = this.filterParser.transform(filter)
        const resultSet = await this.pool.query(`SELECT COUNT(*) AS num FROM ${escapeIdentifier(collectionName)} ${filterExpr}`, parameters)
                                         .catch( translateErrorCodes )
        return parseInt(resultSet.rows[0]['num'], 10)
    }

    async insert(collectionName: string, items: Item[], fields: ResponseField[], upsert?: boolean) {
        const itemsAsParams = items.map((item: Item) => asParamArrays( patchDateTime(item) ))
        const escapedFieldsNames = fields.map( (f: { field: string }) => escapeIdentifier(f.field)).join(', ')
        const upsertAddon = upsert ? ` ON CONFLICT (_id) DO UPDATE SET ${fields.map(f => `${escapeIdentifier(f.field)} = EXCLUDED.${escapeIdentifier(f.field)}`).join(', ')}` : ''
        const query = `INSERT INTO ${escapeIdentifier(collectionName)} (${escapedFieldsNames}) VALUES ${prepareStatementVariablesForBulkInsert(items.length, fields.length)}${upsertAddon}`

        await this.pool.query(query, itemsAsParams.flat()).catch( translateErrorCodes )

        return items.length
    }

    async update(collectionName: string, items: Item[]): Promise<number> {
        const updateFields = updateFieldsFor(items[0])
        const updatables = items.map((i: { [x: string]: any }) => [...updateFields, '_id'].reduce((obj, key) => ({ ...obj, [key]: i[key] }), {}) )
                                .map((u: { [x: string]: any }) => asParamArrays( patchDateTime(u) ))

        const res = await Promise.all(
                        updatables.map(async(updatable: any) => {
                                const rs = await this.pool.query(`UPDATE ${escapeIdentifier(collectionName)} SET ${updateFields.map((f, i) => `${escapeIdentifier(f)} = $${i + 1}`).join(', ')} WHERE _id = $${updateFields.length + 1}`, updatable)
                                                          .catch( translateErrorCodes )
                                return rs.rowCount
                        } ) )
        return res ? res.reduce((sum: number, i: number) => (i ?? 0) + sum, 0): 0
    }

    async delete(collectionName: string, itemIds: string[]): Promise<number> {
        const rs = await this.pool.query(`DELETE FROM ${escapeIdentifier(collectionName)} WHERE _id IN (${prepareStatementVariables(itemIds.length)})`, itemIds)
                             .catch( translateErrorCodes )
        return rs.rowCount
    }

    async truncate(collectionName: string) {
        await this.pool.query(`TRUNCATE ${escapeIdentifier(collectionName)}`).catch( translateErrorCodes )
    }

    async aggregate(collectionName: string, filter: Filter, aggregation: Aggregation, sort: Sort[], skip: number, limit: number): Promise<Item[]> {

        const { filterExpr: whereFilterExpr, parameters: whereParameters, offset } = this.filterParser.transform(filter)
        const { fieldsStatement, groupByColumns, havingFilter: filterExpr, parameters: havingParameters, offset: offsetAfterAggregation } = this.filterParser.parseAggregation(aggregation, offset)
        const { sortExpr } = this.filterParser.orderBy(sort)

        const sql = `SELECT ${fieldsStatement} FROM ${escapeIdentifier(collectionName)} ${whereFilterExpr} GROUP BY ${groupByColumns.map( escapeIdentifier ).join(', ')} ${filterExpr} ${sortExpr} OFFSET $${offsetAfterAggregation} LIMIT $${offsetAfterAggregation+1}`
        const rs = await this.pool.query(sql, [...whereParameters, ...havingParameters, skip, limit])
                                  .catch( translateErrorCodes )
        return rs.rows
    }
}

