const {Spanner} = require('@google-cloud/spanner')
const mysql = require('mysql')
const { SystemFields, validateSystemFields, asWixSchema, parseTableData } = require('velo-external-db-commons')

class DataProvider {
    constructor(projectId, instanceId, databaseId, filterParser) {
        this.filterParser = filterParser

        this.projectId = projectId
        this.instanceId = instanceId
        this.databaseId = databaseId

        this.spanner = new Spanner({projectId: this.projectId})
        this.instance = this.spanner.instance(this.instanceId);
        this.database = this.instance.database(this.databaseId);

        this.systemFields = SystemFields
    }

    async find(collectionName, filter, sort, skip, limit) {
        const {filterExpr, filterColumns, parameters} = this.filterParser.transform(filter)
        const {sortExpr, sortColumns} = this.filterParser.orderBy(sort)

        const query = {
            sql: mysql.format(`SELECT * FROM ?? ${filterExpr} ${sortExpr} LIMIT @limit OFFSET @skip`, [collectionName, ...filterColumns.map( this.patchFieldName ), ...sortColumns.map( this.patchFieldName )]),
            params: {
                skip: skip,
                limit: limit,
            },
        };

        for (let i = 0; i < filterColumns.length; i++) {
            query.sql = query.sql.replace('?', `@${filterColumns[i]}`)
            query.params[filterColumns[i]] = parameters[i]
        }

        const [rows] = await this.database.run(query);

        return rows.map( r => r.toJSON() )
                   .map( this.asEntity.bind(this) )
    }

    async count(collectionName, filter) {
        const {filterExpr, filterColumns, parameters} = this.filterParser.transform(filter)
        const query = {
            sql: mysql.format(`SELECT COUNT(*) AS num FROM ?? ${filterExpr}`.trim(), [collectionName, ...filterColumns.map( this.patchFieldName )]),
            params: { },
        };

        for (let i = 0; i < filterColumns.length; i++) {
            query.sql = query.sql.replace('?', `@${filterColumns[i]}`)
            query.params[filterColumns[i]] = parameters[i]
        }

        const [rows] = await this.database.run(query);
        const objs = rows.map( r => r.toJSON() )

        return objs[0].num;
    }

    async insert(collectionName, item) {
        await this.database.table(collectionName)
                           .insert([this.asDBEntity(item)])
    }

    asDBEntity(item) {
        return Object.keys(item)
                     .reduce((obj, key) => {
                         return { ...obj, [this.patchFieldName(key)]: item[key] }
                     }, {})
    }

    asEntity(dbEntity) {
        return Object.keys(dbEntity)
                     .reduce(function (obj, key) {
                         return { ...obj, [this.unpatchFieldName(key)]: dbEntity[key] }
                     }.bind(this), {})
    }

    patchFieldName(f) {
        if (f.startsWith('_')) {
            return `${f.substring(1)}_`
        }
        return f
    }

    unpatchFieldName(f) {
        if (f.endsWith('_')) {
            return `_${f.slice(0, -1)}`
        }
        return f
    }

    async update(collectionName, item) {
        await this.database.table(collectionName)
                           .update([this.asDBEntity(item)])

        // const systemFieldNames = SystemFields.map(f => f.name)
        // const updateFields = Object.keys(item).filter( k => !systemFieldNames.includes(k) )
        //
        // if (updateFields.length === 0) {
        //     return 0
        // }
        //
        // const sql = this.pool.format(`UPDATE ?? SET ${updateFields.map(() => '?? = ?')} WHERE _id = ?`, [collectionName, ...updateFields])
        // const updatable = [...updateFields, '_id'].reduce((obj, key) => ({ ...obj, [key]: item[key] }), {})
        //
        // const resultset = await this.pool.execute(sql, this.asParamArrays( this.patchDateTime(updatable) ) )
        // return resultset[0].changedRows
    }

    async delete(collectionName, itemIds) {
        await this.database.table(collectionName)
                           .deleteRows(itemIds)
    }

    // wildCardWith(n, char) {
    //     return Array(n).fill(char, 0, n).join(', ')
    // }

    // patchDateTime(item) {
    //     const obj = {}
    //     for (const key of Object.keys(item)) {
    //         const value = item[key]
    //         if (value instanceof Date) {
    //             obj[key] = moment(value).format('YYYY-MM-DD HH:mm:ss');
    //         } else {
    //             obj[key] = value
    //         }
    //     }
    //     return obj
    // }
    //
    // asParamArrays(item) {
    //     return Object.values(item);
    // }
}

module.exports = DataProvider