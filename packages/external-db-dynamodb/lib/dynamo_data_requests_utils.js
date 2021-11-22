const { updateFieldsFor } = require('velo-external-db-commons') 

const findExpression = (collectionName, filter, limit, query) => {
    if (query) 
        filter = filterToQueryFilter(filter)
    return {
        TableName: collectionName, 
        ...filter,
        Limit:limit
    }
}

const countExpression = (collectionName, filter, query) => {
    if (query) 
        filter = filterToQueryFilter(filter)
    return {
        TableName: collectionName, 
        ...filter,
        Select: 'COUNT'
    }
}

const getAllIdsExpression = (collectionName) => ({
    TableName: collectionName,
    AttributesToGet: ['_id']
})

const batchPutItemsExpression = (collectionName, items) => ({
    RequestItems: {
        [collectionName]: items.map(putSingleItemExpression)
    }
})

const putSingleItemExpression = (item) => ({
    PutRequest: {
        Item: item
    }
})

const batchDeleteItemsExpression = (collectionName, itemIds) => ({
    RequestItems: {
        [collectionName]: itemIds.map(deleteSingleItemExpression)
        }
})

const deleteSingleItemExpression = (id) => ({
    DeleteRequest: {
        Key: {
            _id : id
        }
    }
})

const updateSingleItemExpression = (collectionName, item) =>  {
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

const filterToQueryFilter = (filter) => {
    delete Object.assign(filter, {['KeyConditionExpression']: filter['FilterExpression'] })['FilterExpression']
    return filter
}

module.exports = { findExpression, countExpression, getAllIdsExpression,
                   batchPutItemsExpression, putSingleItemExpression, batchDeleteItemsExpression,
                   deleteSingleItemExpression, updateSingleItemExpression
                 }