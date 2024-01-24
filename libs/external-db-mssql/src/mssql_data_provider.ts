import { escapeId, validateLiteral, escape, patchFieldName, escapeTable } from './mssql_utils'
import { updateFieldsFor } from '@wix-velo/velo-external-db-commons'
import { translateErrorCodes } from './sql_exception_translator'
import { ConnectionPool as MSSQLPool } from 'mssql'
import { IDataProvider, AdapterFilter as Filter, NonEmptyAdapterAggregation as Aggregation, Item, Sort } from '@wix-velo/velo-external-db-types'
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
        return await this.query(sql, parameters, collectionName)
    }

    async count(collectionName: string, filter: Filter): Promise<number> {
        const { filterExpr, parameters } = this.filterParser.transform(filter)

        const sql = `SELECT COUNT(*) as num FROM ${escapeTable(collectionName)} ${filterExpr}`
        const rs = await this.query(sql, parameters, collectionName)

        return rs[0]['num']
    }

    patch(item: Item, i?: number) {
        return Object.entries(item).reduce((o, [k, v]) => ( { ...o, [patchFieldName(k, i)]: v } ), {})
    }
    
    async insert(collectionName: string, items: any[], fields: any[], upsert?: boolean): Promise<number> {
        const fieldsNames = fields.map((f: { field: any }) => f.field)
        let sql
        if (upsert) {
            sql = `MERGE ${escapeTable(collectionName)} as target`
                        +` USING (VALUES ${items.map((item: any, i: any) => `(${Object.keys(item).map((key: string) => validateLiteral(key, i) ).join(', ')})`).join(', ')}) as source`
                        +` (${fieldsNames.map( escapeId ).join(', ')}) ON target._id = source._id`
                        +' WHEN NOT MATCHED '
                        +` THEN INSERT (${fieldsNames.map( escapeId ).join(', ')}) VALUES (${fieldsNames.map((f) => `source.${f}` ).join(', ')})`
                        +' WHEN MATCHED'
                        +` THEN UPDATE SET ${fieldsNames.map((f) => `${escapeId(f)} = source.${f}`).join(', ')};`            
        }
        else {
            sql = `INSERT INTO ${escapeTable(collectionName)} (${fieldsNames.map( escapeId ).join(', ')}) VALUES ${items.map((item: any, i: any) => `(${Object.keys(item).map((key: string) => validateLiteral(key, i) ).join(', ')})`).join(', ')}`
        }

        return await this.query(sql, items.reduce((p: any, t: any, i: any) => ( { ...p, ...this.patch(t, i) } ), {}), collectionName, true)
    }

    async update(collectionName: string, items: Item[]): Promise<number> {
        const rss = await Promise.all(items.map((item: Item) => this.updateSingle(collectionName, item)))
        return rss.reduce((s, rs) => s + rs, 0)
    }

    async updateSingle(collectionName: string, item: Item) {
        const updateFields = updateFieldsFor(item)
        const sql = `UPDATE ${escapeTable(collectionName)} SET ${updateFields.map(f => `${escapeId(f)} = ${validateLiteral(f)}`).join(', ')} WHERE _id = ${validateLiteral('_id')}`

        return await this.query(sql, this.patch(item), collectionName, true)
    }


    async delete(collectionName: string, itemIds: string[]): Promise<number> {
        const sql = `DELETE FROM ${escapeTable(collectionName)} WHERE _id IN (${itemIds.map((t: any, i: any) => validateLiteral(`_id${i}`)).join(', ')})`
        const rs = await this.query(sql, itemIds.reduce((p: any, t: any, i: any) => ( { ...p, [patchFieldName(`_id${i}`)]: t } ), {}), collectionName, true)
                             .catch(e => translateErrorCodes(e, collectionName) )
        return rs
    }

    async truncate(collectionName: string): Promise<void> {
        await this.sql.query(`TRUNCATE TABLE ${escapeTable(collectionName)}`).catch(e => translateErrorCodes(e, collectionName))
    }

    async aggregate(collectionName: string, filter: Filter, aggregation: Aggregation, sort: Sort[], skip: number, limit: number): Promise<Item[]> {
        const { filterExpr: whereFilterExpr, parameters: whereParameters } = this.filterParser.transform(filter)
        const { fieldsStatement, groupByColumns, havingFilter, parameters } = this.filterParser.parseAggregation(aggregation)
        const { sortExpr } = this.filterParser.orderBy(sort)
        const pagingQueryStr = this.pagingQueryFor(skip, limit)

        const sql = `SELECT ${fieldsStatement} FROM ${escapeTable(collectionName)} ${whereFilterExpr} GROUP BY ${groupByColumns.map( escapeId ).join(', ')} ${havingFilter} ${sortExpr} ${pagingQueryStr}`

        return await this.query(sql, { ...whereParameters, ...parameters }, collectionName)
    }

    async query(sql: string, parameters: any, collectionName: string, op?: false): Promise<Item[]>
    async query(sql: string, parameters: any, collectionName: string, op?: true): Promise<number>
    async query(sql: string, parameters: any, collectionName: string, op?: boolean| undefined): Promise<Item[] | number> {
        const request = Object.entries(parameters)
                              .reduce((r, [k, v]) => r.input(k, v),
                                      this.sql.request())

        const rs = await request.query(sql)
                                .catch(e => translateErrorCodes(e, collectionName) )

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

    translateErrorCodes(collectionName: string, e: any) {
        return translateErrorCodes(e, collectionName)
    }
}
