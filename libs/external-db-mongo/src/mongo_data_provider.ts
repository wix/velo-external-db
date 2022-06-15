import { translateErrorCodes } from './exception_translator'
import { unpackIdFieldForItem, updateExpressionFor, validateTable } from './mongo_utils'
import { IDataProvider, AdapterFilter as Filter, AdapterAggregation as Aggregation, Item} from '@wix-velo/velo-external-db-types'
import { IMongoFilterParser } from './sql_filter_transformer'
import { MongoClient } from 'mongodb'


export default class DataProvider implements IDataProvider {
    client: MongoClient
    filterParser: IMongoFilterParser
    constructor(client: any, filterParser: any) {
        this.client = client
        this.filterParser = filterParser
    }

    async find(collectionName: string, filter: Filter, sort: any, skip: any, limit: any, projection: any): Promise<Item[]> {
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

    async count(collectionName: string, filter: Filter): Promise<number> {
        validateTable(collectionName)
        const { filterExpr } = this.filterParser.transform(filter)

        return await this.client.db()
                                .collection(collectionName)
                                .count(filterExpr)
    }

    async insert(collectionName: string, items: Item[] ): Promise<number> {
        validateTable(collectionName)
        const result = await this.client.db()
                                        .collection(collectionName)
                                        //@ts-ignore - Type 'string' is not assignable to type 'ObjectId', objectId Can be a 24 character hex string, 12 byte binary Buffer, or a number. and we cant assume that on the _id input
                                        .insertMany(items)
                                        .catch(translateErrorCodes)
        return result.insertedCount
    }

    async update(collectionName: string, items: Item[]): Promise<number> {
        validateTable(collectionName)
        const result = await this.client.db()
                                        .collection(collectionName)
                                        .bulkWrite( updateExpressionFor(items) )
        return result.nModified
    }

    async delete(collectionName: string, itemIds: string[]): Promise<number> {
        validateTable(collectionName)
        const result = await this.client.db()
                                     .collection(collectionName)
                                     .deleteMany({ _id: { $in: itemIds } })
        return result.deletedCount
    }

    async truncate(collectionName: string): Promise<void> {
        validateTable(collectionName)
        await this.client.db()
                         .collection(collectionName)
                         .deleteMany({})
    }

    async aggregate(collectionName: string, filter: Filter, aggregation: Aggregation): Promise<Item[]> {
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