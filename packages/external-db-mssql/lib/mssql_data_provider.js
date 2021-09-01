const { escapeId } = require('./mssql_utils')
const { SystemFields } = require('velo-external-db-commons')
const { translateErrorCodes } = require('./sql_exception_translator')

class DataProvider {
    constructor(pool, filterParser) {
        this.filterParser = filterParser
        this.sql = pool
    }


    async find(collectionName, filter, sort, skip, limit) {
        const {filterExpr, parameters} = this.filterParser.transform(filter)
        const {sortExpr} = this.filterParser.orderBy(sort)
        let offsetSql = ''
        if (skip > 0) {
            offsetSql = `OFFSET ${skip} ROWS`
        }
        let limitSql = ''
        if (skip > 0) {
            limitSql = `FETCH NEXT ${limit} ROWS ONLY`
        }
        const sql = `SELECT * FROM ${escapeId(collectionName)} ${filterExpr} ${sortExpr} ${offsetSql} ${limitSql}`

        return await this.query(sql, parameters)
    }

    async count(collectionName, filter) {
        const {filterExpr, parameters} = this.filterParser.transform(filter)

        const sql = `SELECT COUNT(*) as num FROM ${escapeId(collectionName)} ${filterExpr}`
        const rs = await this.query(sql, parameters)

        return rs[0]['num']
    }

    patch(item) {
        return Object.entries(item).reduce((o, [k, v]) => Object.assign({}, o, {[`x${k}`]: v}), {})
    }

    // todo: check if we can get schema in a safer way. should be according to schema of the table
    async insert(collectionName, items) {
        const rss = await Promise.all(items.map(item => this.insertSingle(collectionName, item)))

        return rss.reduce((s, rs) => s + rs, 0)
    }

    insertSingle(collectionName, item) {
        const sql = `INSERT INTO ${escapeId(collectionName)} (${Object.keys(item).map( escapeId ).join(', ')}) VALUES (${Object.keys(item).map( k => escapeId(`@x${k}`) ).map( escapeId ).join(', ')})`
        return this.query(sql, this.patch(item), true)
    }

    async update(collectionName, items) {
        const rss = await Promise.all(items.map(item => this.updateSingle(collectionName, item)))
        return rss.reduce((s, rs) => s + rs, 0)
    }

    async updateSingle(collectionName, item) {
        const systemFieldNames = SystemFields.map(f => f.name)
        const updateFields = Object.keys(item).filter( k => !systemFieldNames.includes(k) )

        if (updateFields.length === 0) {
            return 0
        }

        const sql = `UPDATE ${escapeId(collectionName)} SET ${updateFields.map(f => `${escapeId(f)} = @${escapeId(`x${f}`)}`).join(', ')} WHERE _id = @x_id`

        return await this.query(sql, this.patch(item), true)
    }


    async delete(collectionName, itemIds) {
        const sql = `DELETE FROM ${escapeId(collectionName)} WHERE _id IN (${itemIds.map((t, i) => `@x_id${i}`).join(', ')})`
        const rs = await this.query(sql, itemIds.reduce((p, t, i) => Object.assign({}, p, { [`x_id${i}`]: t }), {}), true)
                             .catch( translateErrorCodes )
        return rs
    }

    async truncate(collectionName) {
        await this.sql.query(`TRUNCATE TABLE ${escapeId(collectionName)}`).catch( translateErrorCodes )
    }

    async aggregate(collectionName, filter, aggregation) {
        const {filterExpr: whereFilterExpr, parameters: whereParameters} = this.filterParser.transform(filter)
        const {fieldsStatement, groupByColumns, havingFilter, parameters} = this.filterParser.parseAggregation(aggregation.processingStep, aggregation.postFilteringStep)

        const sql = `SELECT ${fieldsStatement} FROM ${escapeId(collectionName)} ${whereFilterExpr} GROUP BY ${groupByColumns.map( escapeId ).join(', ')} ${havingFilter}`

        return await this.query(sql, Object.assign({}, whereParameters, parameters))
    }

    async query(sql, parameters, op) {
        const request = Object.entries(parameters)
                              .reduce((r, [k, v]) => r.input(escapeId(k), v),
                                      this.sql.request())

        const rs = await request.query(sql)
                                .catch( translateErrorCodes )

        if (op) {
            return rs.rowsAffected[0]
        }
        return rs.recordset
    }

}

module.exports = DataProvider