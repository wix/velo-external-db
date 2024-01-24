import { translateErrorCodes } from './exception_translator'
import { insertExpressionFor, isEmptyObject, unpackIdFieldForItem, updateExpressionFor, validateTable } from './mongo_utils'
import { IDataProvider, AdapterFilter as Filter, NonEmptyAdapterAggregation as Aggregation, Item, Sort,  } from '@wix-velo/velo-external-db-types'
import FilterParser from './sql_filter_transformer'
import { MongoClient } from 'mongodb'


export default class DataProvider implements IDataProvider {
    client: MongoClient
    filterParser: FilterParser
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

    async insert(collectionName: string, items: Item[], _fields: any[], upsert = false): Promise<number> {
        validateTable(collectionName)
        const { insertedCount, upsertedCount } = await this.client.db()
                                                                  .collection(collectionName) 
                                                                  .bulkWrite(insertExpressionFor(items, upsert), { ordered: false })
                                                                  .catch(e => translateErrorCodes(e, collectionName))
        
        return insertedCount + upsertedCount
    }

    async update(collectionName: string, items: Item[]): Promise<number> {
        validateTable(collectionName)
        const result = await this.client.db()
                                        .collection(collectionName)
                                        .bulkWrite( updateExpressionFor(items) )
                                        
        
        // In case the updated item matches the item in the DB, nModified will be 0
        //  But the update did not fail, the updated item is indeed in the db so in that case we will return nMatched
        return result.nMatched
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

    async aggregate(collectionName: string, filter: Filter, aggregation: Aggregation, sort: Sort[], skip: number, limit: number): Promise<Item[]> {
        validateTable(collectionName)
        const additionalAggregationStages = []
        const { fieldsStatement, havingFilter } = this.filterParser.parseAggregation(aggregation)
        const { filterExpr } = this.filterParser.transform(filter)
        const sortExpr = this.filterParser.orderAggregationBy(sort)

        !isEmptyObject(sortExpr.$sort)? additionalAggregationStages.push(sortExpr) : null
        skip? additionalAggregationStages.push({ $skip: skip }) : null
        limit? additionalAggregationStages.push({ $limit: limit }) : null
        
        const result = await this.client.db()
                                        .collection(collectionName)
                                        .aggregate([ 
                                            { $match: filterExpr },
                                            fieldsStatement,
                                            havingFilter,
                                            ...additionalAggregationStages
                                        ])
                                        .toArray()

        return result.map( unpackIdFieldForItem )
    }
}
