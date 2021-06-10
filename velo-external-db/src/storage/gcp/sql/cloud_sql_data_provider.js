const moment = require('moment')
const { promisify } = require('util')
const { SystemFields } = require('./cloud_sql_schema_provider')
const translateErrorCodes = require('./sql_exception_translator')

class DataProvider {
    constructor(pool, filterParser) {
        this.filterParser = filterParser
        this.pool = pool
    }

    async find(collectionName, filter, sort, skip, limit) {
        const {filterExpr, filterColumns, parameters} = this.filterParser.transform(filter)
        const {sortExpr, sortColumns} = this.filterParser.orderBy(sort)
        const sql = this.sqlFormat(`SELECT * FROM ?? ${filterExpr} ${sortExpr} LIMIT ?, ?`, [collectionName, ...filterColumns, ...sortColumns])
        const resultset = await promisify(this.pool.query).bind(this.pool)(sql, [...parameters, skip, limit])
                                                   .catch( translateErrorCodes )
        return resultset
    }

    async count(collectionName, filter) {
        const {filterExpr, filterColumns, parameters} = this.filterParser.transform(filter)
        const sql = this.sqlFormat(`SELECT COUNT(*) AS num FROM ?? ${filterExpr}`, [collectionName, ...filterColumns])
        const resultset = await promisify(this.pool.query).bind(this.pool)(sql, parameters)
                                                   .catch( translateErrorCodes )
        return resultset[0]['num']
    }

    async insert(collectionName, item) {
        const n = Object.keys(item).length
        const sql = this.sqlFormat(`INSERT INTO ?? (${this.wildCardWith(n, '??')}) VALUES (${this.wildCardWith(n, '?')})`, [collectionName, ...Object.keys(item)])

        const resultset = await promisify(this.pool.query).bind(this.pool)(sql, this.asParamArrays( this.patchDateTime(item) ) )
                                                   .catch( translateErrorCodes )
        return resultset.affectedRows
    }

    async update(collectionName, item) {
        const systemFieldNames = SystemFields.map(f => f.name)
        const updateFields = Object.keys(item).filter( k => !systemFieldNames.includes(k) )

        if (updateFields.length === 0) {
            return 0
        }

        const sql = this.sqlFormat(`UPDATE ?? SET ${updateFields.map(() => '?? = ?').join(', ')} WHERE _id = ?`, [collectionName, ...updateFields])
        const updatable = [...updateFields, '_id'].reduce((obj, key) => ({ ...obj, [key]: item[key] }), {})

        const resultset = await promisify(this.pool.query).bind(this.pool)(sql, this.asParamArrays( this.patchDateTime(updatable) ) )
                                                   .catch( translateErrorCodes )
        return resultset.changedRows
    }

    async delete(collectionName, itemIds) {
        const sql = this.sqlFormat(`DELETE FROM ?? WHERE _id IN (${this.wildCardWith(itemIds.length, '?')})`, [collectionName])
        const rs = await promisify(this.pool.query).bind(this.pool)(sql, itemIds)
                                            .catch( translateErrorCodes )
        return rs.affectedRows
    }

    async truncate(collectionName) {
        const sql = this.sqlFormat('TRUNCATE ??', [collectionName])
        await promisify(this.pool.query).bind(this.pool)(sql)
                                 .catch( translateErrorCodes )
    }

    async aggregate(collectionName, filter, aggregation, sort, skip, limit) {
        const {filterExpr: whereFilterExpr, filterColumns: whereFilterColumns, parameters: whereParameters} = this.filterParser.transform(filter)
        const {fieldsStatement, groupByColumns, fieldsStatementColumns} = this.filterParser.parseAggregation(aggregation.processingStep)
        const {filterExpr, filterColumns, parameters} = this.filterParser.parseFilter(aggregation.postFilteringStep)
        let havingFilterExpr = ''
        if (filterExpr !=='') {
            havingFilterExpr = `HAVING ${filterExpr}`
        }

        const sql = this.sqlFormat(`SELECT ${fieldsStatement} FROM ?? ${whereFilterExpr} GROUP BY ${this.wildCardWith(groupByColumns.length, '??')} ${havingFilterExpr}`, [...fieldsStatementColumns, collectionName, ...whereFilterColumns, ...groupByColumns, ...filterColumns])
        const resultset = await promisify(this.pool.query).bind(this.pool)(sql, [...whereParameters, ...parameters, skip, limit])
                                                   .catch( translateErrorCodes )
        return resultset
    }

    wildCardWith(n, char) {
        return Array(n).fill(char, 0, n).join(', ')
    }

    patchDateTime(item) {
        const obj = {}
        for (const key of Object.keys(item)) {
            const value = item[key]
            if (value instanceof Date) {
                obj[key] = moment(value).format('YYYY-MM-DD HH:mm:ss');
            } else {
                obj[key] = value
            }
        }
        return obj
    }

    asParamArrays(item) {
        return Object.values(item);
    }

    sqlFormat(template, values) {
        return values.reduce( (sql, f) => sql.replace('??', this.pool.escapeId(f)), template )
    }
}

module.exports = DataProvider