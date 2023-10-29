
import { CreateTableCommandInput } from '@aws-sdk/client-dynamodb'
import { SystemTable } from './dynamo_utils'
import { UpdateCommandInput } from '@aws-sdk/lib-dynamodb'

export const removeColumnExpression = (collectionName: any, columns: any): UpdateCommandInput => ({
    TableName: SystemTable,
    Key: {
        tableName: collectionName
    },
    UpdateExpression: 'SET #attrName = :attrValue',
    ExpressionAttributeNames: {
        '#attrName': 'fields'
    },
    ExpressionAttributeValues: {
        ':attrValue': columns 
    },
    ReturnValues: 'UPDATED_NEW'
})

export const addColumnExpression = (collectionName: any, column: any): UpdateCommandInput => ({
        TableName: SystemTable,
        Key: {
            tableName: collectionName
        },
        UpdateExpression: 'SET #attrName = list_append(#attrName,:attrValue)',
        ExpressionAttributeNames: {
            '#attrName': 'fields'
        },
        ExpressionAttributeValues: {
            ':attrValue': [column]
        },
        ReturnValues: 'UPDATED_NEW'
})

export const createTableExpression = (collectionName: any): CreateTableCommandInput => ({
    TableName: collectionName,
    KeySchema: [{ AttributeName: '_id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: '_id', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST'
})

export const createSystemTableExpression = (): CreateTableCommandInput => ({
    TableName: SystemTable,
    KeySchema: [{ AttributeName: 'tableName', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'tableName', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST'
})

export const insertToSystemTableExpression = (collectionName: any, fields: any) => ({
    TableName: SystemTable, 
    Item: {
    tableName: collectionName,
    fields: fields || [] 
    }
})

export const deleteTableFromSystemTableExpression = (collectionName: any) => ({
    TableName: SystemTable,
    Key: { tableName: collectionName }
})

export const getCollectionFromSystemTableExpression = (collectionName: any) => ({
    TableName: SystemTable,
    Key: { tableName: collectionName }
})

export const listTablesExpression = () => ({
    TableName: SystemTable 
})
