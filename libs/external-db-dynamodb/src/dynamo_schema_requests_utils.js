
const { SystemTable } = require('./dynamo_utils')

const removeColumnExpression = (collectionName, columns) => ({
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

const addColumnExpression = (collectionName, column) => ({
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

const createTableExpression = (collectionName) => ({
    TableName: collectionName,
    KeySchema: [{ AttributeName: '_id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: '_id', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST'
})

const createSystemTableExpression = () => ({
    TableName: SystemTable,
    KeySchema: [{ AttributeName: 'tableName', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'tableName', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST'
})

const insertToSystemTableExpression = (collectionName, fields) => ({
    TableName: SystemTable, 
    Item: {
    tableName: collectionName,
    fields: fields || [] 
    }
})

const deleteTableFromSystemTableExpression = (collectionName) => ({
    TableName: SystemTable,
    Key: { tableName: collectionName }
})

const getCollectionFromSystemTableExpression = (collectionName) => ({
    TableName: SystemTable,
    Key: { tableName: collectionName }
})

const listTablesExpression = () => ({
    TableName: SystemTable 
})

module.exports = { removeColumnExpression, addColumnExpression, createTableExpression, 
                   createSystemTableExpression, insertToSystemTableExpression, deleteTableFromSystemTableExpression,
                   getCollectionFromSystemTableExpression, listTablesExpression
}