const { patchDateTime, updateFieldsFor } = require('velo-external-db-commons')
const { DynamoDBDocument }  = require ('@aws-sdk/lib-dynamodb')
const { validateTable, patchFixDates } = require('./dynamo_utils')

class DataProvider {
    constructor(client, filterParser) {
        this.filterParser = filterParser
        this.client = client
        this.docClient = DynamoDBDocument.from(client)

    }

    async find(collectionName, filter, sort, skip, limit) {
        const {filterExpr} = this.filterParser.transform(filter)
        const response = await this.docClient
                                   .scan({TableName: collectionName, 
                                          ...filterExpr,
                                          Limit:limit
                                          })
        return response.Items.map(patchFixDates)
    }

    async count(collectionName, filter) {
        const {filterExpr} = this.filterParser.transform(filter)
        const response = await this.docClient
                         .scan({TableName: collectionName, 
                                ...filterExpr,
                                Select: 'COUNT'
                                })
        return response.Count
    }

    async insert(collectionName, items) {
        validateTable()
        await this.docClient
                  .batchWrite(this.batchPutItemsExpression(collectionName, items.map(patchDateTime)))
        return items.length //check if there is a way to figure how many deleted/inserted with batchWrite
    }

    async update(collectionName, items) {
        await this.docClient.transactWrite({
            TransactItems:items.map(item=>this.updateSingleItemExpression(collectionName, patchDateTime(item)))
        })
        return items.length
    }

    async delete(collectionName, itemIds) {
        validateTable()
        await this.docClient
                  .batchWrite(this.batchDeleteItemsExpression(collectionName, itemIds))
        return itemIds.length 
    }

    async truncate(collectionName) {
        validateTable(collectionName)
        const rows = await this.docClient
                               .scan({
                                    TableName: collectionName,
                                    AttributesToGet: ['_id']
                                })

        await this.docClient
                  .batchWrite(this.batchDeleteItemsExpression(collectionName, rows.Items.map(item=>item._id)))
    }

//     async aggregate(collectionName, filter, aggregation) {
//         const {filterExpr: whereFilterExpr, parameters: whereParameters} = this.filterParser.transform(filter)
//         const {fieldsStatement, groupByColumns, havingFilter, parameters} = this.filterParser.parseAggregation(aggregation.processingStep, aggregation.postFilteringStep)

//         const sql = `SELECT ${fieldsStatement} FROM ${escapeTable(collectionName)} ${whereFilterExpr} GROUP BY ${groupByColumns.map( escapeId ).join(', ')} ${havingFilter}`
//         const resultset = await this.query(sql, [...whereParameters, ...parameters])
//                                     .catch( translateErrorCodes )
//         return resultset
//     }


    batchPutItemsExpression(collectionName, items) {
        return {
            RequestItems: {
                [collectionName]: items.map(this.putSingleItemExpression)
              }
        }
    }

    putSingleItemExpression(item) {
        return {
            PutRequest: {
                Item: {
                    ...item
                }
            }
        }
    }

    batchDeleteItemsExpression(collectionName, itemIds) {
        return {
            RequestItems: {
                [collectionName]: itemIds.map(this.deleteSingleItemExpression)
              }
        }
    }

    deleteSingleItemExpression(id) {
        return {
            DeleteRequest: {
                Key: {
                    _id : id
                }
            }
        }
    }

    updateSingleItemExpression(collectionName, item) {
        const updateFields = updateFieldsFor(item)
        const updateExpression = `SET ${updateFields.map(f => `#${f} = :${f}`).join(', ')}`
        const expressionAttributeNames = updateFields.reduce((pv, cv)=> ({ ...pv, [`#${cv}`]: cv }), {})
        const expressionAttributeValues = updateFields.reduce((pv, cv)=> ({ ...pv, [`:${cv}`]: item[cv]}), {})

        return {
            Update: {
                TableName: collectionName,
                Key: {
                    _id: item._id
                },
                UpdateExpression: updateExpression,
                ExpressionAttributeNames: expressionAttributeNames,
                ExpressionAttributeValues: expressionAttributeValues
            }
        }
    }

}

module.exports = DataProvider