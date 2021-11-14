const { SystemTable, validateTable } = require('./dynamo_utils')
const { translateErrorCodes } = require('./sql_exception_translator')
const { SystemFields, validateSystemFields, asWixSchema } = require('velo-external-db-commons')
const { CollectionDoesNotExists, FieldAlreadyExists, FieldDoesNotExist } = require('velo-external-db-commons').errors
const { DynamoDBDocument }  = require ('@aws-sdk/lib-dynamodb')

class SchemaProvider {
    constructor(client) {
        this.client = client
        this.docClient = DynamoDBDocument.from(client)
    }



    async list() {
        await this.ensureSystemTableExists()

        const tables = await this.docClient
                                 .scan({ TableName: SystemTable })
        return tables.Items
                     .map(table => asWixSchema([...SystemFields, ...table.fields || []]
                     .map(this.reformatFields)
                     , table.tableName))
    }


    async create(collectionName, columns) {
        validateTable(collectionName)

        const collection = await this.collectionDataFor(collectionName)
        if(!collection) {
            await this.insertToSystemTable(collectionName, columns)
            
            await this.client
                      .createTable({
                        TableName: collectionName,
                        KeySchema: [{ AttributeName: '_id', KeyType: 'HASH' }],
                        AttributeDefinitions: [{ AttributeName: '_id', AttributeType: 'S' }],
                        BillingMode: 'PAY_PER_REQUEST'
                      })
        }
    }

    async drop(collectionName) {
        validateTable(collectionName)
        
        await this.deleteTableFromSystemTable(collectionName)

        await this.client
                  .deleteTable({ TableName: collectionName})
                  .catch(translateErrorCodes)
    }

    async addColumn(collectionName, column) {
        validateTable(collectionName)
        await validateSystemFields(column.name)
        
        const collection = await this.collectionDataFor(collectionName)
        if (!collection) {
            throw new CollectionDoesNotExists('Collection does not exists')
        }

        const fields = collection.fields
        if (fields && fields.find(f => f.name === column.name)) {
            throw new FieldAlreadyExists('Collection already has a field with the same name')
        }

        await this.docClient 
                  .update(this.addColumnParams(collectionName, column)) 
    }

    async removeColumn(collectionName, columnName) {
        validateTable(collectionName)
        await validateSystemFields(columnName)

        const collection = await this.collectionDataFor(collectionName)
        if (!collection) {
            throw new CollectionDoesNotExists('Collection does not exists')
        }
        
        const fields = collection.fields
        if (!fields.find(f => f.name === columnName)) {
            throw new FieldDoesNotExist('Collection does not contain a field with this name')
        }
        await this.docClient
                  .update(this.removeColumnParams(collectionName, fields.filter(f => f.name !== columnName)))

    }

    async describeCollection(collectionName) {
        validateTable(collectionName)
        
        const collection = await this.collectionDataFor(collectionName)
        if (!collection) 
            throw new CollectionDoesNotExists('Collection does not exists')

        return asWixSchema([...SystemFields, ...collection.fields || []].map(this.reformatFields), collection.tableName)
    }

    async ensureSystemTableExists() {
        if (! (await this.systemTableExists()) ) {
            await this.createSystemTable()
        }
    }

    async createSystemTable() {
        await this.client
            .createTable({ // todo: export to func
                TableName: SystemTable,
                KeySchema: [{ AttributeName: 'tableName', KeyType: 'HASH' }],
                AttributeDefinitions: [{ AttributeName: 'tableName', AttributeType: 'S' }],
                BillingMode: 'PAY_PER_REQUEST'
            })
    }

    async insertToSystemTable(collectionName, fields) {        
        await this.docClient
                   .put({ TableName:SystemTable, 
                         Item: {
                            tableName: collectionName,
                            fields: fields || [] 
                         }
                    })
    }

    async deleteTableFromSystemTable(collectionName) {
        await this.docClient
                  .delete({
                      TableName: SystemTable,
                      Key: { tableName: collectionName }
                  })
    }

    async collectionDataFor(collectionName) {
        validateTable(collectionName)
        const response = await this.docClient
                                   .get({
                                        TableName: SystemTable,
                                        Key: { tableName: collectionName  }
                                    })
        return response.Item
    }

    async systemTableExists() {
        return await this.client
                         .describeTable({TableName: SystemTable})
                         .then(() => true)
                         .catch(() =>false)
    }

    putItemParamsForSystemTable(collectionName, fields) {
        const item = { tableName: {S: collectionName} }
        Object.assign(item, fields && fields.length ? { fields: { SS: fields } } : {})
        return {
            TableName: SystemTable,
            Item: item
        }
    }
    
    addColumnParams(collectionName, column) {
        return {
            TableName : SystemTable,
            Key: {
                tableName: collectionName
            },
            UpdateExpression:'SET #attrName = list_append(#attrName,:attrValue)',
            ExpressionAttributeNames : {
                '#attrName' : 'fields'
            },
            ExpressionAttributeValues : {
                ':attrValue' : [column]
            },
            ReturnValues: 'UPDATED_NEW'
          }
    }
    
    removeColumnParams(collectionName, columns) {
        return {
            TableName : SystemTable,
            Key: {
                tableName: collectionName
            },
            UpdateExpression:'SET #attrName = :attrValue',
            ExpressionAttributeNames : {
                '#attrName' : 'fields'
            },
            ExpressionAttributeValues : {
                ':attrValue' : columns 
            },
            ReturnValues: 'UPDATED_NEW'
          }
    }

    reformatFields(field) {
        return {
            field: field.name,
            type: field.type,
        }
    }
}

module.exports = SchemaProvider
