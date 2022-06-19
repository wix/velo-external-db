import { updateFieldsFor } from '@wix-velo/velo-external-db-commons' 
import { isEmptyObject } from './dynamo_utils'
import { DynamoParsedFilter } from './types'

export const findCommand = (collectionName: any, filter: DynamoParsedFilter, limit: any) => {
    if (filter.ExpressionAttributeNames && isEmptyObject(filter.ExpressionAttributeNames)) {
        delete filter.ExpressionAttributeNames
        delete filter.ProjectionExpression
    }
    return {
        TableName: collectionName, 
        ...filter,
        Limit: limit
    }
}

export const countCommand = (collectionName: any, filter: any) => {
    return {
        TableName: collectionName, 
        ...filter,
        Select: 'COUNT'
    }
}

export const getAllIdsCommand = (collectionName: any) => ({
    TableName: collectionName,
    AttributesToGet: ['_id']
})

export const batchPutItemsCommand = (collectionName: any, items: any[]) => ({
    RequestItems: {
        [collectionName]: items.map(putSingleItemCommand)
    }
})

export const putSingleItemCommand = (item: any) => ({
    PutRequest: {
        Item: item
    }
})

export const batchDeleteItemsCommand = (collectionName: any, itemIds: any[]) => ({
    RequestItems: {
        [collectionName]: itemIds.map(deleteSingleItemCommand)
        }
})

export const deleteSingleItemCommand = (id: any) => ({
    DeleteRequest: {
        Key: {
            _id: id
        }
    }
})

export const updateSingleItemCommand = (collectionName: any, item: { [x: string]: any; _id?: any }) =>  {
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
