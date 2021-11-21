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

    async find(collectionName, filter, sort, skip, limit) {
        const {filterExpr} = this.filterParser.transform(filter)
        const { Items } = await this.docClient
                                   .scan(dynamoRequests.findExpression(collectionName, filterExpr, limit))
        return Items.map(patchFixDates)
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
        return items.length //check if there is a way to figure how many deleted/inserted with batchWrite
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

}

module.exports = DataProvider