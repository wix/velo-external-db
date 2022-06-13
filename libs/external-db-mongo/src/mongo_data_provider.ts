import { translateErrorCodes } from './exception_translator'
import { unpackIdFieldForItem, updateExpressionFor, validateTable } from './mongo_utils'

export default class DataProvider {
    client: any
    filterParser: any
    constructor(client: any, filterParser: any) {
        this.client = client
        this.filterParser = filterParser
    }

    async find(collectionName: any, filter: any, sort: any, skip: any, limit: any, projection: any) {
        validateTable(collectionName)
        const { filterExpr } = this.filterParser.transform(filter)
        const { sortExpr } = this.filterParser.orderBy(sort)
        const projectionExpr = this.filterParser.selectFieldsFor(projection)
        return await this.client.db()
                                .collection(collectionName)
                                .find(filterExpr, { ...sortExpr, skip, limit } )
                                .project(projectionExpr)
                                .toArray()
    }

    async count(collectionName: any, filter: any) {
        validateTable(collectionName)
        const { filterExpr } = this.filterParser.transform(filter)

        return await this.client.db()
                                .collection(collectionName)
                                .count(filterExpr)
    }

    async insert(collectionName: any, items: any) {
        validateTable(collectionName)
        const result = await this.client.db()
                                        .collection(collectionName)
                                        .insertMany(items)
                                        .catch(translateErrorCodes)
        return result.insertedCount
    }

    async update(collectionName: any, items: any) {
        validateTable(collectionName)
        const result = await this.client.db()
                                        .collection(collectionName)
                                        .bulkWrite( updateExpressionFor(items) )
        return result.nModified
    }

    async delete(collectionName: any, itemIds: any) {
        validateTable(collectionName)
        const result = await this.client.db()
                                     .collection(collectionName)
                                     .deleteMany({ _id: { $in: itemIds } })
        return result.deletedCount
    }

    async truncate(collectionName: any) {
        validateTable(collectionName)
        await this.client.db()
                         .collection(collectionName)
                         .deleteMany({})
    }

    async aggregate(collectionName: any, filter: any, aggregation: any) {
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