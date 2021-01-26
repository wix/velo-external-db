const moment = require('moment')

class DataProvider {
    constructor(pool) {
        this.pool = pool
    }

    async find(collectionName, filter, sort, skip, limit) {
        const resultset = await this.pool.execute(this.pool.format('SELECT * FROM ??', [collectionName]))
        return resultset[0]
    }

    wildCardWith(n, char) {
        return Array(n).fill(char, 0, n).join(', ')
    }

    async insert(collectionName, item) {
        const n = Object.keys(item).length
        const sql = this.pool.format(`INSERT INTO ?? (${this.wildCardWith(n, '??')}) VALUES (${this.wildCardWith(n, '?')})`, [collectionName].concat(Object.keys(item)))

        const resultset = await this.pool.execute(sql, this.asParamArrays( this.patchDateTime(item) ) )

        return resultset[0].affectedRows
    }

    async delete(collectionName, itemIds) {
        const sql = this.pool.format(`DELETE FROM ?? WHERE _id IN (?)`, [collectionName])
        console.log(sql)
        console.log(itemIds)
        const resultset = await this.pool.execute(sql, itemIds);
        return resultset[0].affectedRows
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