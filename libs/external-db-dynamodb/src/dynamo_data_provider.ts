import { patchDateTime } from '@wix-velo/velo-external-db-commons'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { validateTable, patchFixDates } from './dynamo_utils'
import { DynamoDB, DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { IDynamoDBFilterParser } from './sql_filter_transformer'
import { IDataProvider, AdapterFilter as Filter, Item} from '@wix-velo/velo-external-db-types'
import * as dynamoRequests from './dynamo_data_requests_utils'

export default class DataProvider implements IDataProvider {
    filterParser: IDynamoDBFilterParser
    client: DynamoDB
    docClient: DynamoDBDocument
    constructor(client: DynamoDB, filterParser: any) {
        this.filterParser = filterParser
        this.client = client
        this.docClient = DynamoDBDocument.from(client)
    }

    async query(command: any, queryable: any) {
        return queryable ? await this.docClient.query(command) : await this.docClient.scan(command)
    }

    async find(collectionName: string, filter: Filter, sort: any, skip: any, limit: any, projection: any): Promise<Item[]> {
        const { filterExpr, queryable } = this.filterParser.transform(filter)
        const { projectionExpr, projectionAttributeNames } = this.filterParser.selectFieldsFor(projection)

        const expressionAttributeNames = { ...filterExpr.ExpressionAttributeNames, ...projectionAttributeNames }

        const filterExprWithProjection = { ...filterExpr, ExpressionAttributeNames: expressionAttributeNames }
        if (projectionExpr !== '') Object.assign(filterExprWithProjection, { ProjectionExpression: projectionExpr })

        const { Items } = await this.query(dynamoRequests.findCommand(collectionName, filterExprWithProjection, limit), queryable)

        return Items ? Items.map(patchFixDates) : []
    }
    
    async count(collectionName: string, filter: Filter): Promise<number> {
        const { filterExpr, queryable } = this.filterParser.transform(filter)
        const { Count } = await this.query(dynamoRequests.countCommand(collectionName, filterExpr), queryable)
        return Count || 0
    }

    async insert(collectionName: string, items: Item[]): Promise<number> {
        validateTable(collectionName)
        await this.docClient
                  .batchWrite(dynamoRequests.batchPutItemsCommand(collectionName, items.map(patchDateTime)))
        return items.length
    }

    async update(collectionName: string, items: Item[]): Promise<number> {
        validateTable(collectionName)
        await this.docClient.transactWrite({
            TransactItems: items.map((item: { [x: string]: any }) => dynamoRequests.updateSingleItemCommand(collectionName, patchDateTime(item)))
        })
        return items.length
    }

    async delete(collectionName: string, itemIds: string[]): Promise<number> {
        validateTable(collectionName)
        await this.docClient
                  .batchWrite(dynamoRequests.batchDeleteItemsCommand(collectionName, itemIds))
        return itemIds.length 
    }

    async truncate(collectionName: string): Promise<void> {
        validateTable(collectionName)
        const rows = await this.docClient
                               .scan(dynamoRequests.getAllIdsCommand(collectionName))

        await this.docClient
                  .batchWrite(dynamoRequests.batchDeleteItemsCommand(collectionName, rows.Items? rows.Items.map((item: {[key:string]: any }) => item['_id']): []))
    }
}
