const { recordSetToObj, escapeId, patchFieldName, unpatchFieldName, patchFloat, extractFloatFields } = require('./spanner_utils')

class DataProvider {
    constructor(database, filterParser) {
        this.filterParser = filterParser

        this.database = database
    }

    async find(collectionName, filter, sort, skip, limit, projection) {
        const { filterExpr, parameters } = this.filterParser.transform(filter)
        const { sortExpr } = this.filterParser.orderBy(sort)
        const projectionExpr = this.filterParser.selectFieldsFor(projection)

        const query = {
            sql: `SELECT ${projectionExpr} FROM ${escapeId(collectionName)} ${filterExpr} ${sortExpr} LIMIT @limit OFFSET @skip`,
            params: {
                skip: skip,
                limit: limit,
                ...parameters
            },
        }

        const [rows] = await this.database.run(query)
        return recordSetToObj(rows).map( this.asEntity.bind(this) )
    }

    async count(collectionName, filter) {
        const { filterExpr, parameters } = this.filterParser.transform(filter)
        const query = {
            sql: `SELECT COUNT(*) AS num FROM ${escapeId(collectionName)} ${filterExpr}`.trim(),
            params: parameters,
        }

        const [rows] = await this.database.run(query)
        const objs = recordSetToObj(rows).map( this.asEntity.bind(this) )

        return objs[0].num
    }

    async insert(collectionName, items, fields) {
        const floatFields = extractFloatFields(fields)
        await this.database.table(collectionName)
                            .insert(
                                (items.map(item => patchFloat(item, floatFields)))
                                        .map(this.asDBEntity.bind(this))
                            )
        return items.length
    }

    asDBEntity(item) {
        return Object.keys(item)
                     .reduce((obj, key) => {
                         return { ...obj, [patchFieldName(key)]: item[key] }
                     }, {})
    }

    fixDates(value) {
        if (value instanceof Date) {
            // todo: fix this hack !!!
            const date = value.toISOString()
            const date2 = `${date.substring(0, date.lastIndexOf('.') + 4)}${date.slice(-1)}`
            return new Date(date2)
        }
        return value

    }

    asEntity(dbEntity) {
        return Object.keys(dbEntity)
                     .reduce(function(obj, key) {
                         return { ...obj, [unpatchFieldName(key)]: this.fixDates(dbEntity[key]) }
                     }.bind(this), {})
    }

    async update(collectionName, items, _fields) {
        const floatFields = extractFloatFields(_fields || [])
        await this.database.table(collectionName)
                           .update(
                               (items.map(item => patchFloat(item, floatFields)))
                                     .map(this.asDBEntity.bind(this))
                           )
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

        const [rows] = await this.database.run(query)
        const itemIds = recordSetToObj(rows).map( this.asEntity.bind(this) ).map(e => e._id)

        await this.delete(collectionName, itemIds)
    }

    async aggregate(collectionName, filter, aggregation) {
        const { filterExpr: whereFilterExpr, parameters: whereParameters } = this.filterParser.transform(filter)

        const { fieldsStatement, groupByColumns, havingFilter, parameters } = this.filterParser.parseAggregation(aggregation)
        const query = {
            sql: `SELECT ${fieldsStatement} FROM ${escapeId(collectionName)} ${whereFilterExpr} GROUP BY ${groupByColumns.map( escapeId ).join(', ')} ${havingFilter}`,
            params: { ...whereParameters, ...parameters },
        }

        const [rows] = await this.database.run(query)
        return recordSetToObj(rows).map( this.asEntity.bind(this) )
    }

}

module.exports = DataProvider