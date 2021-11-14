// const { escapeId, escapeTable } = require('./dynamo_utils')
// const { promisify } = require('util')
const { asParamArrays, patchDateTime, updateFieldsFor } = require('velo-external-db-commons')
// const { translateErrorCodes } = require('./sql_exception_translator')
// const { wildCardWith } = require('./dynamo_utils')
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
        return response.ScannedCount
    }

    async insert(collectionName, items) {
        validateTable()
        await this.docClient
                  .batchWrite(this.batchPutItemsExpression(collectionName, items.map(patchDateTime)))
    }

    async update(collectionName, items) {
        const result = await this.docClient.transactWrite({
            TransactItems:items.map(item=>this.updateSingleItemExpression(collectionName, patchDateTime(item)))
        })
        console.log(result)
        return result
//         const updateFields = updateFieldsFor(items[0])
//         const queries = items.map(() => `UPDATE ${escapeTable(collectionName)} SET ${updateFields.map(f => `${escapeId(f)} = ?`).join(', ')} WHERE _id = ?` )
//                              .join(';')
//         const updatables = items.map(i => [...updateFields, '_id'].reduce((obj, key) => ({ ...obj, [key]: i[key] }), {}) )
//                                 .map(u => asParamArrays( patchDateTime(u) ))
//         const resultset = await this.query(queries, [].concat(...updatables))
//                                     .catch( translateErrorCodes )

//         return Array.isArray(resultset) ? resultset.reduce((s, r) => s + r.changedRows, 0) : resultset.changedRows
    }

    async delete(collectionName, itemIds) {
        validateTable()
        await this.docClient
                  .batchWrite(this.batchDeleteItemsExpression(collectionName, itemIds))
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
    //rename like mongo
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
    //rename like mongo
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
        let updateExpression = 'set'
        let ExpressionAttributeNames = {}
        let ExpressionAttributeValues = {}
        for (const property in item) {
          updateExpression += ` #${property} = :${property} ,`
          ExpressionAttributeNames['#'+property] = property 
          ExpressionAttributeValues[':'+property] = item[property]
        }
        updateExpression= updateExpression.slice(0, -1)

        return {
            Update: {
                TableName: collectionName,
                Key: {
                    _id: item._id
                },
                updateExpression,
                ExpressionAttributeNames,
                ExpressionAttributeValues
            }
        }
    }

}

module.exports = DataProvider