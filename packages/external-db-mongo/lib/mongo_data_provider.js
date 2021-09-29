// const { SystemFields } = require('velo-external-db-commons')
// const { translateErrorCodes } = require('./sql_exception_translator')

const { isObject } = require('velo-external-db-commons')

class DataProvider {
    constructor(client, filterParser) {
        this.client = client
        this.filterParser = filterParser
    }

    async find(collectionName, filter, sort, skip, limit) {
        const { filterExpr } = this.filterParser.transform(filter)
        const { sortExpr } = this.filterParser.orderBy(sort)

        return await this.client.db().collection(collectionName)
                              .find(filterExpr,
                                    Object.assign({}, { skip, limit }, sortExpr))
                              .toArray()
    }

    async count(collectionName, filter) {
        const { filterExpr } = this.filterParser.transform(filter)

        const result = await this.client.db().collection(collectionName)
                                      .count(filterExpr)
        return result
    }

    async insert(collectionName, items) {
        const rss = await this.client.db().collection(collectionName)
                                   .insertMany(items)
        return rss.insertedCount
    }

    async update(collectionName, items) {
        const result = await this.client.db().collection(collectionName)
                                    .bulkWrite(items.map((item)=>this.updateSingleObj(item)))
        return result.nModified
    }

    updateSingleObj(item){
        return { updateOne: 
                    {
                        'filter': { '_id': item._id },
                        'update': { '$set': { ...item } }
                    }}
    }


    async delete(collectionName, itemIds) {
        const rss = await this.client.db().collection(collectionName)
                                   .remove({ _id: { $in: itemIds } })
        return rss.deletedCount
    }

    async truncate(collectionName) {
        await this.client.db().collection(collectionName)
                       .remove({})
    }

    async aggregate(collectionName, filter, aggregation) {
        const { fieldsStatement, havingFilter } = this.filterParser.parseAggregation(aggregation.processingStep, aggregation.postFilteringStep)
        const { filterExpr } = this.filterParser.transform(filter)
        const aggregateResult = await this.client.db().collection(collectionName)
                                .aggregate( [ { $match: filterExpr },
                                                fieldsStatement,
                                                havingFilter
                                            ] )
                                .toArray()
    
        aggregateResult.map((result)=>{
            if (isObject(result._id)){
                Object.assign(result,result._id)
                if (isObject(result._id)) delete result._id
            }
        }) //todo - refactor this
        return aggregateResult

    }
}

module.exports = DataProvider