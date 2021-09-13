 const { dbName } = require('./mongo_utils')
// const { SystemFields } = require('velo-external-db-commons')
// const { translateErrorCodes } = require('./sql_exception_translator')

class DataProvider {
    constructor(client, filterParser) {
        this.client = client
        this.filterParser = filterParser
        this.pool = this.client.db(dbName(client))
    }

    async find(collectionName, filter, sort, skip, limit) {
        const { filterExpr } = this.filterParser.transform(filter)
        const { sortExpr } = this.filterParser.orderBy(sort)

        return await this.pool.collection(collectionName).find(filterExpr,
            Object.assign({}, { skip, limit }, sortExpr))
            .toArray()
    }

    async count(collectionName, filter) {
        const { filterExpr } = this.filterParser.transform(filter)

        const result = await this.pool.collection(collectionName).count(filterExpr)
        return result
    }

    async insert(collectionName, items) {
        const rss = await this.pool.collection(collectionName).insertMany(items)
        return rss.insertedCount
    }

    async update(collectionName, items) {

        const rss = await Promise.all(items.map(item => this.updateSingle(collectionName, item)))

        return rss.map((r) => r.modifiedCount).reduce((s, rs) => s + rs)
    }

    async updateSingle(collectionName, item) {
        return await this.pool.collection(collectionName).updateOne({ _id: item._id },
            { $set: { ...item } })
    }

    async delete(collectionName, itemIds) {
        const rss = await this.pool.collection(collectionName).remove({ _id: { $in: itemIds } })
        return rss.deletedCount
    }

    async truncate(collectionName) {
        await this.pool.collection(collectionName).remove({})
    }

    async aggregate(collectionName, filter, aggregation) {
        const { fieldsStatement, groupByColumns, havingFilter, parameters } = this.filterParser.parseAggregation(aggregation.processingStep, aggregation.postFilteringStep)
        const { filterExpr } = this.filterParser.transform(filter)

        return await this.pool.collection(collectionName).aggregate( [
            { $match: filterExpr },
            {
              $group: fieldsStatement
            },
            { $match: havingFilter }
         ] ).toArray()
        return result;
    }

}




module.exports = DataProvider