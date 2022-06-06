const { updateFieldsFor } = require('@wix-velo/velo-external-db-commons') 
const { isEmptyObject } = require('./dynamo_utils')

const findCommand = (collectionName, filter, limit) => {
    if (isEmptyObject(filter.ExpressionAttributeNames)) {
        delete filter.ExpressionAttributeNames
        delete filter.ProjectionExpression
    }
    return {
        TableName: collectionName, 
        ...filter,
        Limit: limit
    }
}

const countCommand = (collectionName, filter) => {
    return {
        TableName: collectionName, 
        ...filter,
        Select: 'COUNT'
    }
}

const getAllIdsCommand = (collectionName) => ({
    TableName: collectionName,
    AttributesToGet: ['_id']
})

const batchPutItemsCommand = (collectionName, items) => ({
    RequestItems: {
        [collectionName]: items.map(putSingleItemCommand)
    }
})

const putSingleItemCommand = (item) => ({
    PutRequest: {
        Item: item
    }
})

const batchDeleteItemsCommand = (collectionName, itemIds) => ({
    RequestItems: {
        [collectionName]: itemIds.map(deleteSingleItemCommand)
        }
})

const deleteSingleItemCommand = (id) => ({
    DeleteRequest: {
        Key: {
            _id: id
        }
    }
})

const updateSingleItemCommand = (collectionName, item) =>  {
    const updateFields = updateFieldsFor(item)
    const updateExpression = `SET ${updateFields.map(f => `#${f} = :${f}`).join(', ')}`
    const expressionAttributeNames = updateFields.reduce((pv, cv) => ({ ...pv, [`#${cv}`]: cv }), {})
    const expressionAttributeValues = updateFields.reduce((pv, cv) => ({ ...pv, [`:${cv}`]: item[cv] }), {})

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

module.exports = { findCommand, countCommand, getAllIdsCommand,
                   batchPutItemsCommand, putSingleItemCommand, batchDeleteItemsCommand,
                   deleteSingleItemCommand, updateSingleItemCommand
                 }