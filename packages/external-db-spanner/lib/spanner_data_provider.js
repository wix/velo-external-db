const { recordSetToObj, escapeId } = require('./spanner_utils')
const { SystemFields } = require('velo-external-db-commons')

class DataProvider {
    constructor(database, filterParser) {
        this.filterParser = filterParser

        this.database = database
    }

    async find(collectionName, filter, sort, skip, limit) {
        const {filterExpr, parameters} = this.filterParser.transform(filter)
        const { sortExpr } = this.filterParser.orderBy(sort)

        const query = {
            sql: `SELECT * FROM ${escapeId(collectionName)} ${filterExpr} ${sortExpr} LIMIT @limit OFFSET @skip`,
            params: {
                skip: skip,
                limit: limit,
            },
        }
        Object.assign(query.params, parameters)

        const [rows] = await this.database.run(query);
        return recordSetToObj(rows).map( this.asEntity.bind(this) )
    }

    async count(collectionName, filter) {
        const {filterExpr, parameters} = this.filterParser.transform(filter)
        const query = {
            sql: `SELECT COUNT(*) AS num FROM ${escapeId(collectionName)} ${filterExpr}`.trim(),
            params: { },
        };
        Object.assign(query.params, parameters)

        const [rows] = await this.database.run(query)
        const objs = recordSetToObj(rows).map( this.asEntity.bind(this) )

        return objs[0].num;
    }

    async insert(collectionName, items) {
        await this.database.table(collectionName)
                           .insert(items.map(this.asDBEntity.bind(this)))
        return items.length
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
            return `x${f}`
        }
        return f
    }

    unpatchFieldName(f) {
        if (f.startsWith('x_')) {
            return f.slice(1)
        }
        return f
    }

    async update(collectionName, items) {
        const item = items[0]
        const systemFieldNames = SystemFields.map(f => f.name)
        const updateFields = Object.keys(item).filter( k => !systemFieldNames.includes(k) )

        if (updateFields.length === 0) {
            return 0
        }

        await this.database.table(collectionName)
                           .update(items.map( this.asDBEntity.bind(this) ))
        return items.length
    }

    async delete(collectionName, itemIds) {
        await this.database.table(collectionName)
                           .deleteRows(itemIds)
        return itemIds.length
    }

    async truncate(collectionName) {
        // todo: properly implement this
        const query = {
            sql: `SELECT * FROM ${escapeId(collectionName)} LIMIT @limit OFFSET @skip`,
            params: {
                skip: 0,
                limit: 1000,
            },
        }

        const [rows] = await this.database.run(query);
        const itemIds = recordSetToObj(rows).map( this.asEntity.bind(this) ).map(e => e._id)

        await this.delete(collectionName, itemIds)
    }

    async aggregate(collectionName, filter, aggregation) {
        const {filterExpr: whereFilterExpr, parameters: whereParameters} = this.filterParser.transform(filter)
        const {fieldsStatement, groupByColumns, havingFilter, parameters} = this.filterParser.parseAggregation(aggregation.processingStep, aggregation.postFilteringStep)

        const query = {
            sql: `SELECT ${fieldsStatement} FROM ${escapeId(collectionName)} ${whereFilterExpr} GROUP BY ${groupByColumns.map( escapeId ).join(', ')} ${havingFilter}`,
            params: { },
        }

        Object.assign(query.params, whereParameters, parameters)

        const [rows] = await this.database.run(query)
        return recordSetToObj(rows).map( this.asEntity.bind(this) )
    }

}

module.exports = DataProvider