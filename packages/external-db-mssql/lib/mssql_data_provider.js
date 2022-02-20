const { escapeId, validateLiteral, escape, patchFieldName, escapeTable } = require('./mssql_utils')
const { updateFieldsFor } = require('velo-external-db-commons')
const { translateErrorCodes } = require('./sql_exception_translator')

class DataProvider {
    constructor(pool, filterParser) {
        this.filterParser = filterParser
        this.sql = pool
    }

    async find(collectionName, filter, sort, skip, limit) {
        const { filterExpr, parameters } = this.filterParser.transform(filter)
        const { sortExpr } = this.filterParser.orderBy(sort)
        const pagingQueryStr = this.pagingQueryFor(skip, limit)

        const sql = `SELECT * FROM ${escapeTable(collectionName)} ${filterExpr} ${sortExpr} ${pagingQueryStr}`

        return await this.query(sql, parameters)
    }

    async count(collectionName, filter) {
        const { filterExpr, parameters } = this.filterParser.transform(filter)

        const sql = `SELECT COUNT(*) as num FROM ${escapeTable(collectionName)} ${filterExpr}`
        const rs = await this.query(sql, parameters)

        return rs[0]['num']
    }

    patch(item) {
        return Object.entries(item).reduce((o, [k, v]) => ( { ...o, [patchFieldName(k)]: v } ), {})
    }
    
    async insert(collectionName, items, fields) {
        const fieldsNames = fields.map(f => f.field)
        const rss = await Promise.all(items.map(item => this.insertSingle(collectionName, item, fieldsNames)))

        return rss.reduce((s, rs) => s + rs, 0)
    }

    insertSingle(collectionName, item, fieldsNames) {
        const sql = `INSERT INTO ${escapeTable(collectionName)} (${fieldsNames.map( escapeId ).join(', ')}) VALUES (${Object.keys(item).map( validateLiteral ).join(', ')})`
        return this.query(sql, this.patch(item), true)
    }

    async update(collectionName, items) {
        const rss = await Promise.all(items.map(item => this.updateSingle(collectionName, item)))
        return rss.reduce((s, rs) => s + rs, 0)
    }

    async updateSingle(collectionName, item) {
        const updateFields = updateFieldsFor(item)
        const sql = `UPDATE ${escapeTable(collectionName)} SET ${updateFields.map(f => `${escapeId(f)} = ${validateLiteral(f)}`).join(', ')} WHERE _id = ${validateLiteral('_id')}`

        return await this.query(sql, this.patch(item), true)
    }


    async delete(collectionName, itemIds) {
        const sql = `DELETE FROM ${escapeTable(collectionName)} WHERE _id IN (${itemIds.map((t, i) => validateLiteral(`_id${i}`)).join(', ')})`
        const rs = await this.query(sql, itemIds.reduce((p, t, i) => ( { ...p, [patchFieldName(`_id${i}`)]: t } ), {}), true)
                             .catch( translateErrorCodes )
        return rs
    }

    async truncate(collectionName) {
        await this.sql.query(`TRUNCATE TABLE ${escapeTable(collectionName)}`).catch( translateErrorCodes )
    }

    async aggregate(collectionName, filter, aggregation) {
        const { filterExpr: whereFilterExpr, parameters: whereParameters } = this.filterParser.transform(filter)
        const { fieldsStatement, groupByColumns, havingFilter, parameters } = this.filterParser.parseAggregation(aggregation)

        const sql = `SELECT ${fieldsStatement} FROM ${escapeTable(collectionName)} ${whereFilterExpr} GROUP BY ${groupByColumns.map( escapeId ).join(', ')} ${havingFilter}`

        return await this.query(sql, { ...whereParameters, ...parameters })
    }

    async query(sql, parameters, op) {
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

    pagingQueryFor(skip, limit) {
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

module.exports = DataProvider