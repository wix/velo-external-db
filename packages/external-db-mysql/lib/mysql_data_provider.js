const moment = require('moment')
const { promisify } = require('util')
const { SystemFields } = require('./mysql_schema_provider')
const { EMPTY_FILTER } = require('./sql_filter_transformer')
const translateErrorCodes = require('./sql_exception_translator')

class DataProvider {
    constructor(pool, filterParser) {
        this.filterParser = filterParser
        this.pool = pool

        this.query = promisify(this.pool.query).bind(this.pool)
    }

    async find(collectionName, filter, sort, skip, limit) {
        const {filterExpr, filterColumns, parameters} = this.filterParser.transform(filter)
        const {sortExpr, sortColumns} = this.filterParser.orderBy(sort)
        const sql = this.sqlFormat(`SELECT * FROM ?? ${filterExpr} ${sortExpr} LIMIT ?, ?`, [collectionName, ...filterColumns, ...sortColumns])
        const resultset = await this.query(sql, [...parameters, skip, limit])
                                    .catch( translateErrorCodes )
        return resultset
    }

    async count(collectionName, filter) {
        const {filterExpr, filterColumns, parameters} = this.filterParser.transform(filter)
        const sql = this.sqlFormat(`SELECT COUNT(*) AS num FROM ?? ${filterExpr}`, [collectionName, ...filterColumns])
        const resultset = await this.query(sql, parameters)
                                    .catch( translateErrorCodes )
        return resultset[0]['num']
    }

    // todo: check if we can get schema in a safer way. should be according to schema of the table
    async insert(collectionName, items) {
        const item = items[0]
        const n = Object.keys(item).length
        const sql = this.sqlFormat(`INSERT INTO ?? (${this.wildCardWith(n, '??')}) VALUES ?`, [collectionName, ...Object.keys(item)])
        
        const data = items.map(item => this.asParamArrays( this.patchDateTime(item) ) )
        const resultset = await this.query(sql, [data])
                                    .catch( translateErrorCodes )
        return resultset.affectedRows
    }

    async update(collectionName, items) {
        const item = items[0]
        const systemFieldNames = SystemFields.map(f => f.name)
        const updateFields = Object.keys(item).filter( k => !systemFieldNames.includes(k) )

        if (updateFields.length === 0) {
            return 0
        }

        const queries = items.map(() => this.sqlFormat(`UPDATE ?? SET ${updateFields.map(() => '?? = ?').join(', ')} WHERE _id = ?`, [collectionName, ...updateFields]) )
                             .join(';')
        const updatables = items.map(i => [...updateFields, '_id'].reduce((obj, key) => ({ ...obj, [key]: i[key] }), {}) )
                                .map(u => this.asParamArrays( this.patchDateTime(u) ))
        const resultset = await this.query(queries, [].concat(...updatables))
                                    .catch( translateErrorCodes )

        return Array.isArray(resultset) ? resultset.reduce((s, r) => s + r.changedRows, 0) : resultset.changedRows
    }

    async delete(collectionName, itemIds) {
        const sql = this.sqlFormat(`DELETE FROM ?? WHERE _id IN (${this.wildCardWith(itemIds.length, '?')})`, [collectionName])
        const rs = await this.query(sql, itemIds)
                             .catch( translateErrorCodes )
        return rs.affectedRows
    }

    async truncate(collectionName) {
        const sql = this.sqlFormat('TRUNCATE ??', [collectionName])
        await this.query(sql).catch( translateErrorCodes )
    }

    async aggregate(collectionName, filter, aggregation) {
        const {filterExpr: whereFilterExpr, filterColumns: whereFilterColumns, parameters: whereParameters} = this.filterParser.transform(filter)
        const {fieldsStatement, groupByColumns, fieldsStatementColumns} = this.filterParser.parseAggregation(aggregation.processingStep)
        const havingFilter = this.filterParser.parseFilter(aggregation.postFilteringStep)

        const {filterExpr, filterColumns, parameters} =
            havingFilter.map(({filterExpr, filterColumns, parameters}) => ({ filterExpr: filterExpr !== '' ? `HAVING ${filterExpr}` : '',
                                                                             filterColumns, parameters}))
                        .concat(EMPTY_FILTER)[0]

        const sql = this.sqlFormat(`SELECT ${fieldsStatement} FROM ?? ${whereFilterExpr} GROUP BY ${this.wildCardWith(groupByColumns.length, '??')} ${filterExpr}`, [...fieldsStatementColumns, collectionName, ...whereFilterColumns, ...groupByColumns, ...filterColumns])
        const resultset = await this.query(sql, [...whereParameters, ...parameters])
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
            const reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;

            if (value instanceof Date) {
                obj[key] = moment(value).format('YYYY-MM-DD HH:mm:ss')
            } else if (reISO.test(value)) {
                obj[key] = moment(new Date(value)).format('YYYY-MM-DD HH:mm:ss')
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