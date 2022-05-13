const { patchDateTime } = require('velo-external-db-commons')
const { DynamoDBDocument }  = require ('@aws-sdk/lib-dynamodb')
const { validateTable, patchFixDates } = require('./dynamo_utils')
const dynamoRequests = require ('./dynamo_data_requests_utils')

class DataProvider {
    constructor(client, filterParser) {
        this.filterParser = filterParser
        this.client = client
        this.docClient = DynamoDBDocument.from(client)
    }

    async query(command, queryable) {
        return queryable ? await this.docClient.query(command) : await this.docClient.scan(command)
    }

    async find(collectionName, filter, sort, skip, limit, projection) {
        const { filterExpr, queryable } = this.filterParser.transform(filter)
        const { projectionExpr, projectionAttributeNames } = this.filterParser.selectFieldsFor(projection)

        const expressionAttributeNames = { ...filterExpr.ExpressionAttributeNames, ...projectionAttributeNames }

        const filterExprWithProjection = { ...filterExpr, ExpressionAttributeNames: expressionAttributeNames }
        if (projectionExpr !== '') Object.assign(filterExprWithProjection, { ProjectionExpression: projectionExpr })

        const { Items } = await this.query(dynamoRequests.findCommand(collectionName, filterExprWithProjection, limit), queryable)

        return Items.map(patchFixDates)
    }
    
    async count(collectionName, filter) {
        const { filterExpr, queryable } = this.filterParser.transform(filter)
        const { Count } = await this.query(dynamoRequests.countCommand(collectionName, filterExpr), queryable)
        return Count
    }

    async insert(collectionName, items) {
        validateTable(collectionName)
        await this.docClient
                  .batchWrite(dynamoRequests.batchPutItemsCommand(collectionName, items.map(patchDateTime)))
        return items.length
    }

    async update(collectionName, items) {
        validateTable(collectionName)
        await this.docClient.transactWrite({
            TransactItems: items.map(item => dynamoRequests.updateSingleItemCommand(collectionName, patchDateTime(item)))
        })
        return items.length
    }

    async delete(collectionName, itemIds) {
        validateTable(collectionName)
        await this.docClient
                  .batchWrite(dynamoRequests.batchDeleteItemsCommand(collectionName, itemIds))
        return itemIds.length 
    }

    async truncate(collectionName) {
        validateTable(collectionName)
        const rows = await this.docClient
                               .scan(dynamoRequests.getAllIdsCommand(collectionName))

        await this.docClient
                  .batchWrite(dynamoRequests.batchDeleteItemsCommand(collectionName, rows.Items.map(item => item._id)))
    }
}

module.exports = DataProvider