import { escapeId, validateLiteral, escape, patchFieldName, escapeTable } from './mssql_utils'
import { updateFieldsFor } from '@wix-velo/velo-external-db-commons'
import { translateErrorCodes } from './sql_exception_translator'
import { ConnectionPool as MSSQLPool } from 'mssql'
import { IDataProvider, AdapterFilter as Filter, AdapterAggregation as Aggregation, Item} from '@wix-velo/velo-external-db-types'
import FilterParser from './sql_filter_transformer'

export default class DataProvider implements IDataProvider {
    filterParser: FilterParser
    sql: MSSQLPool
    constructor(pool: any, filterParser: any) {
        this.filterParser = filterParser
        this.sql = pool
    }

    async find(collectionName: string, filter: Filter, sort: any, skip: any, limit: any, projection: any): Promise<Item[]> {
        const { filterExpr, parameters } = this.filterParser.transform(filter)
        const { sortExpr } = this.filterParser.orderBy(sort)
        const pagingQueryStr = this.pagingQueryFor(skip, limit)
        const projectionExpr = this.filterParser.selectFieldsFor(projection)

        const sql = `SELECT ${projectionExpr} FROM ${escapeTable(collectionName)} ${filterExpr} ${sortExpr} ${pagingQueryStr}`
        return await this.query(sql, parameters)
    }

    async count(collectionName: string, filter: Filter): Promise<number> {
        const { filterExpr, parameters } = this.filterParser.transform(filter)

        const sql = `SELECT COUNT(*) as num FROM ${escapeTable(collectionName)} ${filterExpr}`
        const rs = await this.query(sql, parameters)

        return rs[0]['num']
    }

    patch(item: Item) {
        return Object.entries(item).reduce((o, [k, v]) => ( { ...o, [patchFieldName(k)]: v } ), {})
    }
    
    async insert(collectionName: string, items: any[], fields: any[]): Promise<number> {
        const fieldsNames = fields.map((f: { field: any }) => f.field)
        const rss = await Promise.all(items.map((item: any) => this.insertSingle(collectionName, item, fieldsNames)))

        return rss.reduce((s, rs) => s + rs, 0)
    }

    insertSingle(collectionName: string, item: Item, fieldsNames: string[]): Promise<number> {
        const sql = `INSERT INTO ${escapeTable(collectionName)} (${fieldsNames.map( escapeId ).join(', ')}) VALUES (${Object.keys(item).map( validateLiteral ).join(', ')})`
        return this.query(sql, this.patch(item), true)
    }

    async update(collectionName: string, items: Item[]): Promise<number> {
        const rss = await Promise.all(items.map((item: Item) => this.updateSingle(collectionName, item)))
        return rss.reduce((s, rs) => s + rs, 0)
    }

    async updateSingle(collectionName: string, item: Item) {
        const updateFields = updateFieldsFor(item)
        const sql = `UPDATE ${escapeTable(collectionName)} SET ${updateFields.map(f => `${escapeId(f)} = ${validateLiteral(f)}`).join(', ')} WHERE _id = ${validateLiteral('_id')}`

        return await this.query(sql, this.patch(item), true)
    }


    async delete(collectionName: string, itemIds: string[]): Promise<number> {
        const sql = `DELETE FROM ${escapeTable(collectionName)} WHERE _id IN (${itemIds.map((t: any, i: any) => validateLiteral(`_id${i}`)).join(', ')})`
        const rs = await this.query(sql, itemIds.reduce((p: any, t: any, i: any) => ( { ...p, [patchFieldName(`_id${i}`)]: t } ), {}), true)
                             .catch( translateErrorCodes )
        return rs
    }

    async truncate(collectionName: string): Promise<void> {
        await this.sql.query(`TRUNCATE TABLE ${escapeTable(collectionName)}`).catch( translateErrorCodes )
    }

    async aggregate(collectionName: string, filter: Filter, aggregation: Aggregation): Promise<Item[]> {
        const { filterExpr: whereFilterExpr, parameters: whereParameters } = this.filterParser.transform(filter)
        const { fieldsStatement, groupByColumns, havingFilter, parameters } = this.filterParser.parseAggregation(aggregation)

        const sql = `SELECT ${fieldsStatement} FROM ${escapeTable(collectionName)} ${whereFilterExpr} GROUP BY ${groupByColumns.map( escapeId ).join(', ')} ${havingFilter}`

        return await this.query(sql, { ...whereParameters, ...parameters })
    }

    async query(sql: string, parameters: any, op?: false): Promise<Item[]>
    async query(sql: string, parameters: any, op?: true): Promise<number>
    async query(sql: string, parameters: any, op?: boolean| undefined): Promise<Item[] | number> {
        const request = Object.entries(parameters)
                              .reduce((r, [k, v]) => r.input(k, v),
                                      this.sql.request())

        const rs = await request.query(sql)
                                .catch( translateErrorCodes )

        if (op) {
            return rs.rowsAffected[0]
        }
        return rs.recordset
    }

    pagingQueryFor(skip: number, limit: any) {
        let offsetSql = ''
        if (skip > 0) {
            offsetSql = `OFFSET ${escape(skip)} ROWS`
        }
        let limitSql = ''
        if (skip > 0) {
            limitSql = `FETCH NEXT ${escape(limit)} ROWS ONLY`
        }
        return `${offsetSql} ${limitSql}`.trim()
    }


}
