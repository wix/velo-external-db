const { escapeIdentifier, patchDateTime, prepareStatementVariables, asParamArrays  } = require('./postgres_utils')
const { SystemFields } = require('./postgres_schema_provider')
const translateErrorCodes = require('./sql_exception_translator')

class DataProvider {
    constructor(pool, filterParser) {
        this.filterParser = filterParser
        this.pool = pool
    }

    async find(collectionName, filter, sort, skip, limit) {
        const {filterExpr, parameters, offset} = this.filterParser.transform(filter)
        const {sortExpr} = this.filterParser.orderBy(sort)

        const resultset = await this.pool.query(`SELECT * FROM ${escapeIdentifier(collectionName)} ${filterExpr} ${sortExpr} OFFSET $${offset} LIMIT $${offset + 1}`, [...parameters, skip, limit])
                                    .catch( translateErrorCodes )
        return resultset.rows
    }

    async count(collectionName, filter) {
        const {filterExpr, parameters} = this.filterParser.transform(filter)
        const resultset = await this.pool.query(`SELECT COUNT(*) AS num FROM ${escapeIdentifier(collectionName)} ${filterExpr}`, parameters)
                                         .catch( translateErrorCodes )
        return parseInt(resultset.rows[0]['num'], 10)
    }

    // todo: check if we can get schema in a safer way. should be according to schema of the table
    async insert(collectionName, items) {
        const item = items[0]
        const n = Object.keys(item).length

        const res = await Promise.all(
            items.map(async item => {
                const data = asParamArrays( patchDateTime(item) )
                const res = await this.pool.query(`INSERT INTO ${escapeIdentifier(collectionName)} (${Object.keys(item).map( escapeIdentifier )}) VALUES (${prepareStatementVariables(n)})`, data)
                               .catch( translateErrorCodes )
                return res.rowCount
            } ) )
        return res.reduce((sum, i) => i + sum, 0)
    }

    async update(collectionName, items) {
        const item = items[0]
        const systemFieldNames = SystemFields.map(f => f.name)
        const updateFields = Object.keys(item).filter( k => !systemFieldNames.includes(k) )

        if (updateFields.length === 0) {
            return 0
        }

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
        const {filterExpr: whereFilterExpr, parameters: whereParameters, offset} = this.filterParser.transform(filter)
        const {fieldsStatement, groupByColumns, havingFilter: filterExpr, parameters: havingParameters} = this.filterParser.parseAggregation(aggregation.processingStep, aggregation.postFilteringStep, offset)

        const sql = `SELECT ${fieldsStatement} FROM ${escapeIdentifier(collectionName)} ${whereFilterExpr} GROUP BY ${groupByColumns.map( escapeIdentifier ).join(', ')} ${filterExpr}`
        const rs = await this.pool.query(sql, [...whereParameters, ...havingParameters])
                                  .catch( translateErrorCodes )
        return rs.rows
    }
}

module.exports = DataProvider