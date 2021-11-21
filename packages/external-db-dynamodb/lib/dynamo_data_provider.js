const { patchDateTime } = require('velo-external-db-commons')
const { DynamoDBDocument }  = require ('@aws-sdk/lib-dynamodb')
const { validateTable, patchFixDates, patchCollectionKeys } = require('./dynamo_utils')
const dynamoRequests = require ('./dynamo_data_requests_utils')

class DataProvider {
    constructor(client, filterParser) {
        this.filterParser = filterParser
        this.client = client
        this.docClient = DynamoDBDocument.from(client)

    }

    async find(collectionName, filter, sort, skip, limit) {
        const {filterExpr} = this.filterParser.transform(filter)
        let response        
        if (await this.canQuery(filterExpr, patchCollectionKeys()))
            response = await this.docClient
                                 .query(dynamoRequests.findExpression(collectionName, filterExpr, limit, true))
        else 
            response =  await this.docClient
                                  .scan(dynamoRequests.findExpression(collectionName, filterExpr, limit))
        
        return response.Items.map(patchFixDates)
    }

    async count(collectionName, filter) {
        const {filterExpr} = this.filterParser.transform(filter)
        const { Count } = await this.docClient
                                    .scan(dynamoRequests.countExpression(collectionName, filterExpr))            
        return Count
    }

    async insert(collectionName, items) {
        validateTable()
        await this.docClient
                  .batchWrite(dynamoRequests.batchPutItemsExpression(collectionName, items.map(patchDateTime)))
        return items.length
    }

    async update(collectionName, items) {
        await this.docClient.transactWrite({
            TransactItems: items.map(item => dynamoRequests.updateSingleItemExpression(collectionName, patchDateTime(item)))
        })
        return items.length
    }

    async delete(collectionName, itemIds) {
        validateTable()
        await this.docClient
                  .batchWrite(dynamoRequests.batchDeleteItemsExpression(collectionName, itemIds))
        return itemIds.length 
    }

    async truncate(collectionName) {
        validateTable(collectionName)
        const rows = await this.docClient
                               .scan(dynamoRequests.getAllIdsExpression(collectionName))

        await this.docClient
                  .batchWrite(dynamoRequests.batchDeleteItemsExpression(collectionName, rows.Items.map(item=>item._id)))
    }
    
    async canQuery(filterExpr, collectionKeys) {
        if (!filterExpr) return false

        const filterAttributes = Object.values(filterExpr.ExpressionAttributeNames) 
        return filterAttributes.every(v=> collectionKeys.includes(v))
    }
}

module.exports = DataProvider