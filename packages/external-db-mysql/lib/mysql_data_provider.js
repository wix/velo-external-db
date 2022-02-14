const { escapeId, escapeTable } = require('./mysql_utils')
const { promisify } = require('util')
const { asParamArrays, patchDateTime, updateFieldsFor } = require('velo-external-db-commons')
const { translateErrorCodes } = require('./sql_exception_translator')
const { wildCardWith } = require('./mysql_utils')

class DataProvider {
    constructor(pool, filterParser) {
        this.filterParser = filterParser
        this.pool = pool

        this.query = promisify(this.pool.query).bind(this.pool)
    }

    async find(collectionName, filter, sort, skip, limit, projection) {
        const { filterExpr, parameters } = this.filterParser.transform(filter)
        const { sortExpr } = this.filterParser.orderBy(sort)
        const projectionExpr = this.filterParser.selectFieldsFor(projection)
        const sql = `SELECT ${projectionExpr} FROM ${escapeTable(collectionName)} ${filterExpr} ${sortExpr} LIMIT ?, ?`
        const resultset = await this.query(sql, [...parameters, skip, limit])
                                    .catch( translateErrorCodes )
        return resultset
    }

    async count(collectionName, filter) {
        const { filterExpr, parameters } = this.filterParser.transform(filter)
        const sql = `SELECT COUNT(*) AS num FROM ${escapeTable(collectionName)} ${filterExpr}`
        const resultset = await this.query(sql, parameters)
                                    .catch( translateErrorCodes )
        return resultset[0]['num']
    }

    async insert(collectionName, items) {
        const item = items[0]
        const sql = `INSERT INTO ${escapeTable(collectionName)} (${Object.keys(item).map( escapeId ).join(', ')}) VALUES ?`
        
        const data = items.map(item => asParamArrays( patchDateTime(item) ) )
        const resultset = await this.query(sql, [data])
                                    .catch( translateErrorCodes )
        return resultset.affectedRows
    }

    async update(collectionName, items) {
        const updateFields = updateFieldsFor(items[0])
        const queries = items.map(() => `UPDATE ${escapeTable(collectionName)} SET ${updateFields.map(f => `${escapeId(f)} = ?`).join(', ')} WHERE _id = ?` )
                             .join(';')
        const updatables = items.map(i => [...updateFields, '_id'].reduce((obj, key) => ({ ...obj, [key]: i[key] }), {}) )
                                .map(u => asParamArrays( patchDateTime(u) ))
        const resultset = await this.query(queries, [].concat(...updatables))
                                    .catch( translateErrorCodes )

        return Array.isArray(resultset) ? resultset.reduce((s, r) => s + r.changedRows, 0) : resultset.changedRows
    }

    async delete(collectionName, itemIds) {
        const sql = `DELETE FROM ${escapeTable(collectionName)} WHERE _id IN (${wildCardWith(itemIds.length, '?')})`
        const rs = await this.query(sql, itemIds)
                             .catch( translateErrorCodes )
        return rs.affectedRows
    }

    async truncate(collectionName) {
        await this.query(`TRUNCATE ${escapeTable(collectionName)}`).catch( translateErrorCodes )
    }

    async aggregate(collectionName, filter, aggregation) {
        const { filterExpr: whereFilterExpr, parameters: whereParameters } = this.filterParser.transform(filter)
        const { fieldsStatement, groupByColumns, havingFilter, parameters } = this.filterParser.parseAggregation(aggregation)

        const sql = `SELECT ${fieldsStatement} FROM ${escapeTable(collectionName)} ${whereFilterExpr} GROUP BY ${groupByColumns.map( escapeId ).join(', ')} ${havingFilter}`
        const resultset = await this.query(sql, [...whereParameters, ...parameters])
                                    .catch( translateErrorCodes )
        return resultset
    }
}

module.exports = DataProvider