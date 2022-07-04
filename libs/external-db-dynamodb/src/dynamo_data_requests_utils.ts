import { updateFieldsFor } from '@wix-velo/velo-external-db-commons' 
import { Item } from '@wix-velo/velo-external-db-types'
import { isEmptyObject } from './dynamo_utils'
import { DynamoParsedFilter } from './types'

export const findCommand = (collectionName: string, filter: DynamoParsedFilter, limit: number) => {
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

export const countCommand = (collectionName: string, filter: DynamoParsedFilter) => {
    return {
        TableName: collectionName, 
        ...filter,
        Select: 'COUNT'
    }
}

export const getAllIdsCommand = (collectionName: string) => ({
    TableName: collectionName,
    AttributesToGet: ['_id']
})

export const batchPutItemsCommand = (collectionName: string, items: Item[]) => ({
    RequestItems: {
        [collectionName]: items.map(putSingleItemCommand)
    }
})

export const putSingleItemCommand = (item: Item) => ({
    PutRequest: {
        Item: item
    }
})

export const batchDeleteItemsCommand = (collectionName: string, itemIds: string[]) => ({
    RequestItems: {
        [collectionName]: itemIds.map(deleteSingleItemCommand)
        }
})

export const deleteSingleItemCommand = (id: string) => ({
    DeleteRequest: {
        Key: {
            _id: id
        }
    }
})

export const updateSingleItemCommand = (collectionName: string, item: Item) =>  {
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
