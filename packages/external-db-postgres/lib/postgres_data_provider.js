const { escapeIdentifier, prepareStatementVariables  } = require('./postgres_utils')
const { asParamArrays, patchDateTime, updateFieldsFor } = require('velo-external-db-commons')
const { translateErrorCodes } = require('./sql_exception_translator')

class DataProvider {
    constructor(pool, filterParser) {
        this.filterParser = filterParser
        this.pool = pool
    }

    async find(collectionName, filter, sort, skip, limit, projection) {
        const { filterExpr, parameters, offset } = this.filterParser.transform(filter)
        const { sortExpr } = this.filterParser.orderBy(sort)
        const projectionExpr = this.filterParser.selectFieldsFor(projection)
        const resultset = await this.pool.query(`SELECT ${projectionExpr} FROM ${escapeIdentifier(collectionName)} ${filterExpr} ${sortExpr} OFFSET $${offset} LIMIT $${offset + 1}`, [...parameters, skip, limit])
                                    .catch( translateErrorCodes )
        return resultset.rows
    }

    async count(collectionName, filter) {
        const { filterExpr, parameters } = this.filterParser.transform(filter)
        const resultset = await this.pool.query(`SELECT COUNT(*) AS num FROM ${escapeIdentifier(collectionName)} ${filterExpr}`, parameters)
                                         .catch( translateErrorCodes )
        return parseInt(resultset.rows[0]['num'], 10)
    }

    async insert(collectionName, items, fields) {

        const n = fields.length
        const escapedFieldsNames = fields.map( f => escapeIdentifier(f.field)).join(', ')
        const res = await Promise.all(
            items.map(async item => {
                const data = asParamArrays( patchDateTime(item) )
                const res = await this.pool.query(`INSERT INTO ${escapeIdentifier(collectionName)} (${escapedFieldsNames}) VALUES (${prepareStatementVariables(n)})`, data)
                               .catch( translateErrorCodes )
                return res.rowCount
            } ) )
        return res.reduce((sum, i) => i + sum, 0)
    }

    async update(collectionName, items) {
        const updateFields = updateFieldsFor(items[0])
        const updatables = items.map(i => [...updateFields, '_id'].reduce((obj, key) => ({ ...obj, [key]: i[key] }), {}) )
                                .map(u => asParamArrays( patchDateTime(u) ))

        const res = await Promise.all(
                        updatables.map(async updatable => {
                                const rs = await this.pool.query(`UPDATE ${escapeIdentifier(collectionName)} SET ${updateFields.map((f, i) => `${escapeIdentifier(f)} = $${i + 1}`).join(', ')} WHERE _id = $${updateFields.length + 1}`, updatable)
                                                          .catch( translateErrorCodes )
                                return rs.rowCount
                        } ) )
        return res.reduce((sum, i) => i + sum, 0)
    }

    async delete(collectionName, itemIds) {
        const rs = await this.pool.query(`DELETE FROM ${escapeIdentifier(collectionName)} WHERE _id IN (${prepareStatementVariables(itemIds.length)})`, itemIds)
                             .catch( translateErrorCodes )
        return rs.rowCount
    }

    async truncate(collectionName) {
        await this.pool.query(`TRUNCATE ${escapeIdentifier(collectionName)}`).catch( translateErrorCodes )
    }

    async aggregate(collectionName, filter, aggregation) {
        const { filterExpr: whereFilterExpr, parameters: whereParameters, offset } = this.filterParser.transform(filter)
        const { fieldsStatement, groupByColumns, havingFilter: filterExpr, parameters: havingParameters } = this.filterParser.parseAggregation(aggregation, offset)

        const sql = `SELECT ${fieldsStatement} FROM ${escapeIdentifier(collectionName)} ${whereFilterExpr} GROUP BY ${groupByColumns.map( escapeIdentifier ).join(', ')} ${filterExpr}`
        const rs = await this.pool.query(sql, [...whereParameters, ...havingParameters])
                                  .catch( translateErrorCodes )
        return rs.rows
    }
}

module.exports = DataProvider