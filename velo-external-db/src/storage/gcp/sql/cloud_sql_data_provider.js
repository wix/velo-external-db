const moment = require('moment')
const { SystemFields } = require('./cloud_sql_schema_provider')

class DataProvider {
    constructor(pool, filterParser) {
        this.filterParser = filterParser
        this.pool = pool
    }

    async find(collectionName, filter, sort, skip, limit) {
        const {filterExpr, filterColumns, parameters} = this.filterParser.transform(filter)
        const {sortExpr, sortColumns} = this.filterParser.orderBy(sort)
        const sql = this.pool.format(`SELECT * FROM ?? ${filterExpr} ${sortExpr} LIMIT ?, ?`, [collectionName, ...filterColumns, ...sortColumns])
        const resultset = await this.pool.execute(sql, [...parameters, skip, limit])
        return resultset[0]
    }

    async count(collectionName, filter) {
        const {filterExpr, filterColumns, parameters} = this.filterParser.transform(filter)
        const sql = this.pool.format(`SELECT COUNT(*) AS num FROM ?? ${filterExpr}`, [collectionName, ...filterColumns])
        const resultset = await this.pool.execute(sql, parameters)
        return resultset[0][0]['num']
    }

    async insert(collectionName, item) {
        const n = Object.keys(item).length
        const sql = this.pool.format(`INSERT INTO ?? (${this.wildCardWith(n, '??')}) VALUES (${this.wildCardWith(n, '?')})`, [collectionName, ...Object.keys(item)])

        console.log(sql, Object.values(this.patchDateTime(item)))
        const resultset = await this.pool.execute(sql, this.asParamArrays( this.patchDateTime(item) ) )

        return resultset[0].affectedRows
    }

    async update(collectionName, item) {
        const systemFieldNames = SystemFields.map(f => f.name)
        const updateFields = Object.keys(item).filter( k => !systemFieldNames.includes(k) )

        if (updateFields.length === 0) {
            return 0
        }

        const sql = this.pool.format(`UPDATE ?? SET ${updateFields.map(() => '?? = ?').join(', ')} WHERE _id = ?`, [collectionName, ...updateFields])
        const updatable = [...updateFields, '_id'].reduce((obj, key) => ({ ...obj, [key]: item[key] }), {})

        console.log(item, updateFields, sql, Object.values(this.patchDateTime(item)))
        const resultset = await this.pool.execute(sql, this.asParamArrays( this.patchDateTime(updatable) ) )
        return resultset[0].changedRows
    }

    async delete(collectionName, itemIds) {
        const sql = this.pool.format(`DELETE FROM ?? WHERE _id IN (${this.wildCardWith(itemIds.length, '?')})`, [collectionName])
        const rs = await this.pool.execute(sql, itemIds);
        return rs[0].affectedRows
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
}

module.exports = DataProvider