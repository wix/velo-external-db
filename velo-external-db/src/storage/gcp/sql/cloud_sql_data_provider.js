const moment = require('moment')

class DataProvider {
    constructor(pool, filterParser) {
        this.filterParser = filterParser
        this.pool = pool
    }

    async find(collectionName, filter, sort, skip, limit) {
        const {filterExpr, filterColumns, parameters} = this.filterParser.transform(filter)
        const {sortExpr, sortColumns} = this.filterParser.orderBy(sort)
        const sql = this.pool.format(`SELECT * FROM ?? ${filterExpr} ${sortExpr} LIMIT ?, ?`, [collectionName].concat(filterColumns).concat(sortColumns))
        const resultset = await this.pool.execute(sql, parameters.concat([skip, limit]))
        return resultset[0]
    }

    async count(collectionName, filter) {
        const {filterExpr, filterColumns, parameters} = this.filterParser.transform(filter)
        const sql = this.pool.format(`SELECT COUNT(*) AS num FROM ?? ${filterExpr}`, [collectionName].concat(filterColumns))
        const resultset = await this.pool.execute(sql, parameters)
        return resultset[0][0]['num']
    }

    async insert(collectionName, item) {
        const n = Object.keys(item).length
        const sql = this.pool.format(`INSERT INTO ?? (${this.wildCardWith(n, '??')}) VALUES (${this.wildCardWith(n, '?')})`, [collectionName].concat(Object.keys(item)))

        const resultset = await this.pool.execute(sql, this.asParamArrays( this.patchDateTime(item) ) )

        return resultset[0].affectedRows
    }

    update(collectionName, item) {

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