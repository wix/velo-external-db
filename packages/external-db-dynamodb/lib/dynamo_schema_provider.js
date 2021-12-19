const { SystemTable, validateTable, reformatFields } = require('./dynamo_utils')
const { translateErrorCodes } = require('./sql_exception_translator')
const { SystemFields, validateSystemFields } = require('velo-external-db-commons')
const { CollectionDoesNotExists, FieldAlreadyExists, FieldDoesNotExist } = require('velo-external-db-commons').errors
const { DynamoDBDocument }  = require ('@aws-sdk/lib-dynamodb')
const dynamoRequests = require ('./dynamo_schema_requests_utils')

class SchemaProvider {
    constructor(client) {
        this.client = client
        this.docClient = DynamoDBDocument.from(client)
    }

    async list() {
        await this.ensureSystemTableExists()

        const { Items } = await this.docClient
                                    .scan(dynamoRequests.listTablesExpression())
        return Items.map(table => ({
            id: table.tableName,
            fields: [...SystemFields, ...table.fields].map(reformatFields)
        }))
    }

    async listHeaders() {
        await this.ensureSystemTableExists()

        const { Items } = await this.docClient
                                    .scan(dynamoRequests.listTablesExpression())
        return Items.map(table => table.tableName)
    }

    supportedOperations() {
        return ['todo']
    }

    async create(collectionName, columns) {
        await this.ensureSystemTableExists()
        validateTable(collectionName)

        const collection = await this.collectionDataFor(collectionName, true)
        if (!collection) {
            await this.insertToSystemTable(collectionName, columns)
            
            await this.client
                      .createTable(dynamoRequests.createTableExpression(collectionName))
        }
    }

    async drop(collectionName) {
        await this.ensureSystemTableExists()
        validateTable(collectionName)
        
        await this.deleteTableFromSystemTable(collectionName)

        await this.client
                  .deleteTable({ TableName: collectionName })
                  .catch(translateErrorCodes)
    }

    async addColumn(collectionName, column) {
        await this.ensureSystemTableExists()
        validateTable(collectionName)
        await validateSystemFields(column.name)
        
        const { fields } = await this.collectionDataFor(collectionName)
        if (fields.find(f => f.name === column.name)) {
            throw new FieldAlreadyExists('Collection already has a field with the same name')
        }

        await this.docClient 
                  .update(dynamoRequests.addColumnExpression(collectionName, column)) 
    }

    async removeColumn(collectionName, columnName) {
        await this.ensureSystemTableExists()
        validateTable(collectionName)
        await validateSystemFields(columnName)

        const { fields } = await this.collectionDataFor(collectionName)

        if (!fields.some(f => f.name === columnName)) {
            throw new FieldDoesNotExist('Collection does not contain a field with this name')
        }
        await this.docClient
                  .update(dynamoRequests.removeColumnExpression(collectionName, fields.filter(f => f.name !== columnName)))

    }

    async describeCollection(collectionName) {
        await this.ensureSystemTableExists()
        validateTable(collectionName)
        
        const collection = await this.collectionDataFor(collectionName)

        return [...SystemFields, ...collection.fields].map( reformatFields )
    }

    async ensureSystemTableExists() {
        if (!(await this.systemTableExists()) ) {
            await this.createSystemTable()
        }
    }

    async createSystemTable() {
        await this.client
                  .createTable(dynamoRequests.createSystemTableExpression())
    }

    async insertToSystemTable(collectionName, fields) {        
        await this.docClient
                   .put(dynamoRequests.insertToSystemTableExpression(collectionName, fields))
    }

    async deleteTableFromSystemTable(collectionName) {
        await this.docClient
                  .delete(dynamoRequests.deleteTableFromSystemTableExpression(collectionName))
    }

    async collectionDataFor(collectionName, toReturn) {
        validateTable(collectionName)
        const { Item } = await this.docClient
                                   .get(dynamoRequests.getCollectionFromSystemTableExpression(collectionName))

        if (!Item && !toReturn ) throw new CollectionDoesNotExists('Collection does not exists')
        return Item
    }

    async systemTableExists() {
        return await this.client
                         .describeTable({ TableName: SystemTable })
                         .then(() => true)
                         .catch(() => false)
    }
}

module.exports = SchemaProvider
