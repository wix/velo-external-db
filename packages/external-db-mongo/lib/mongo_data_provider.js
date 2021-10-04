const { unpackIdFieldForItem, updateExpressionFor } = require('./mongo_utils')

class DataProvider {
    constructor(client, filterParser) {
        this.client = client
        this.filterParser = filterParser
    }

    async find(collectionName, filter, sort, skip, limit) {
        const { filterExpr } = this.filterParser.transform(filter)
        const { sortExpr } = this.filterParser.orderBy(sort)
        return await this.client.db()
                                .collection(collectionName)
                                .find(filterExpr, { ...sortExpr, skip, limit } )
                                .toArray()
    }

    async count(collectionName, filter) {
        const { filterExpr } = this.filterParser.transform(filter)

        return await this.client.db()
                                .collection(collectionName)
                                .count(filterExpr)
    }

    async insert(collectionName, items) {
        const result = await this.client.db()
                                        .collection(collectionName)
                                        .insertMany(items)
        return result.insertedCount
    }

    async update(collectionName, items) {
        const result = await this.client.db()
                                        .collection(collectionName)
                                        .bulkWrite( updateExpressionFor(items) )
        return result.nModified
    }

    async delete(collectionName, itemIds) {
        const result = await this.client.db()
                                     .collection(collectionName)
                                     .remove({ _id: { $in: itemIds } })
        return result.deletedCount
    }

    async truncate(collectionName) {
        await this.client.db()
                         .collection(collectionName)
                         .remove({})
    }

    async aggregate(collectionName, filter, aggregation) {
        const { fieldsStatement, havingFilter } = this.filterParser.parseAggregation(aggregation.processingStep, aggregation.postFilteringStep)
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