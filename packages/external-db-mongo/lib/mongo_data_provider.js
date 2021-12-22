const { unpackIdFieldForItem, updateExpressionFor, validateTable } = require('./mongo_utils')

class DataProvider {
    constructor(client, filterParser) {
        this.client = client
        this.filterParser = filterParser
    }

    async find(collectionName, filter, sort, skip, limit) {
        validateTable(collectionName)
        const { filterExpr } = this.filterParser.transform(filter)
        const { sortExpr } = this.filterParser.orderBy(sort)
        return await this.client.db()
                                .collection(collectionName)
                                .find(filterExpr, { ...sortExpr, skip, limit } )
                                .toArray()
    }

    async count(collectionName, filter) {
        validateTable(collectionName)
        const { filterExpr } = this.filterParser.transform(filter)

        return await this.client.db()
                                .collection(collectionName)
                                .count(filterExpr)
    }

    async insert(collectionName, items) {
        validateTable(collectionName)
        const result = await this.client.db()
                                        .collection(collectionName)
                                        .insertMany(items)
        return result.insertedCount
    }

    async update(collectionName, items) {
        validateTable(collectionName)
        const result = await this.client.db()
                                        .collection(collectionName)
                                        .bulkWrite( updateExpressionFor(items) )
        return result.nModified
    }

    async delete(collectionName, itemIds) {
        validateTable(collectionName)
        const result = await this.client.db()
                                     .collection(collectionName)
                                     .deleteMany({ _id: { $in: itemIds } })
        return result.deletedCount
    }

    async truncate(collectionName) {
        validateTable(collectionName)
        await this.client.db()
                         .collection(collectionName)
                         .deleteMany({})
    }

    async aggregate(collectionName, filter, aggregation) {
        validateTable(collectionName)
        const { fieldsStatement, havingFilter } = this.filterParser.parseAggregation(aggregation)
        const { filterExpr } = this.filterParser.transform(filter)
        const result = await this.client.db()
                                    .collection(collectionName)
                                    .aggregate( [ { $match: filterExpr },
                                         fieldsStatement,
                                         havingFilter
                                    ] )
                                    .toArray()

        return result.map( unpackIdFieldForItem )
    }
}


module.exports = DataProvider