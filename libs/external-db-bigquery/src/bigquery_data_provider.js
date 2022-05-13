const { unPatchDateTime, patchDateTime, escapeIdentifier } = require('./bigquery_utils')
const { asParamArrays, updateFieldsFor } = require('velo-external-db-commons')
const { translateErrorCodes } = require('./sql_exception_translator')

class DataProvider {
    constructor(pool, filterParser) {
        this.filterParser = filterParser
        this.pool = pool
    }

    async find(collectionName, filter, sort, skip, limit, projection) {
        const { filterExpr, parameters } = this.filterParser.transform(filter)
        const { sortExpr } = this.filterParser.orderBy(sort)
        const projectionExpr = this.filterParser.selectFieldsFor(projection)

        const sql = `SELECT ${projectionExpr} FROM ${escapeIdentifier(collectionName)} ${filterExpr} ${sortExpr} LIMIT ${limit} OFFSET ${skip}`

        const resultSet = await this.pool.query({ query: sql, params: parameters })
                                         .catch( translateErrorCodes )

        return resultSet[0].map( unPatchDateTime )
    }

    async count(collectionName, filter) {
        const { filterExpr, parameters } = this.filterParser.transform(filter)
        const sql = `SELECT COUNT(*) AS num FROM ${escapeIdentifier(collectionName)} ${filterExpr}`

        const resultSet = await this.pool.query({
            query: sql,
            params: parameters
        })
    
        return resultSet[0][0]['num']
    }

    async insert(collectionName, items) {
        const table = await this.pool.table(collectionName)
        await table.insert(items)

        return items.length
    }

    async update(collectionName, items) {
        const updateFields = updateFieldsFor(items[0])
        const queries = items.map(() => `UPDATE ${escapeIdentifier(collectionName)} SET ${updateFields.map(f => `${escapeIdentifier(f)} = ?`).join(', ')} WHERE _id = ?` )
                             .join(';')
        const updateTables = items.map(i => [...updateFields, '_id'].reduce((obj, key) => ({ ...obj, [key]: i[key] }), {}) )
                                .map(u => asParamArrays( patchDateTime(u) ))

        const resultSet = await this.pool.query({ query: queries, params: [].concat(...updateTables) })
                                    .catch( translateErrorCodes )

        return resultSet[0].length
    }

    async delete(collectionName, itemIds) {
        const sql = `DELETE FROM ${escapeIdentifier(collectionName)} WHERE _id IN UNNEST(@idsList)`

        const rs = await this.pool.query({ query: sql, params: { idsList: itemIds }, types: { idsList: ['STRING'] } })
                             .catch( translateErrorCodes )
        
        return rs[0]
    }

    async truncate(collectionName) {
        await this.pool.query(`TRUNCATE TABLE ${escapeIdentifier(collectionName)}`)
                  .catch( translateErrorCodes )
    }

    async aggregate(collectionName, filter, aggregation) {
        const { filterExpr: whereFilterExpr, parameters: whereParameters } = this.filterParser.transform(filter)
        const { fieldsStatement, groupByColumns, havingFilter, parameters } = this.filterParser.parseAggregation(aggregation)

        const sql = `SELECT ${fieldsStatement} FROM ${escapeIdentifier(collectionName)} ${whereFilterExpr} GROUP BY ${groupByColumns.map( escapeIdentifier ).join(', ')} ${havingFilter}`

        const resultSet = await this.pool.query({ query: sql, params: [...whereParameters, ...parameters] })
                                    .catch( translateErrorCodes )

        return resultSet[0].map( unPatchDateTime )
    }
}

module.exports = DataProvider