
import { InputField } from '@wix-velo/velo-external-db-types'
import { SystemTable } from './dynamo_utils'

export const updateColumnsExpression = (collectionName: any, columns: any) => ({
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

export const addColumnExpression = (collectionName: any, column: any) => ({
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

export const changeColumnTypeExpression = (collectionName: string, column: InputField) => ({
    TableName: SystemTable,
    Key: {
        tableName: collectionName
    },
    UpdateExpression: 'SET #attrName = list_append(list_append(:attrValue1, list_remove(#attrName, :attrValue2)), :attrValue3)',
    ExpressionAttributeNames: {
        '#attrName': 'fields'
    },
    ExpressionAttributeValues: {
        ':attrValue1': [column],
        ':attrValue2': column.name,
        ':attrValue3': [column]
    },
})

export const createTableExpression = (collectionName: any) => ({
    TableName: collectionName,
    KeySchema: [{ AttributeName: '_id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: '_id', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST'
})

export const createSystemTableExpression = () => ({
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
