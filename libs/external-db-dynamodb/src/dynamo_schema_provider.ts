import { SystemTable, validateTable, reformatFields } from './dynamo_utils'
import { translateErrorCodes } from './sql_exception_translator'
import { SystemFields, validateSystemFields, errors } from '@wix-velo/velo-external-db-commons'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import * as dynamoRequests from './dynamo_schema_requests_utils'
import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { InputField, ISchemaProvider, ResponseField, SchemaOperations, Table, TableHeader } from '@wix-velo/velo-external-db-types'
const { CollectionDoesNotExists, FieldAlreadyExists, FieldDoesNotExist } = errors

export default class SchemaProvider implements ISchemaProvider {
    client: DynamoDB
    docClient: DynamoDBDocument
    constructor(client: DynamoDB) {
        this.client = client
        this.docClient = DynamoDBDocument.from(client)
    }

    async list(): Promise<Table[]> {
        await this.ensureSystemTableExists()

        const { Items } = await this.docClient
                                    .scan(dynamoRequests.listTablesExpression())

        return Items ? Items.map((table: { [x:string]: any ,tableName?: any, fields?: any }) => ({
            id: table.tableName,
            fields: [...SystemFields, ...table.fields].map(reformatFields)
        })) : []
    }

    async listHeaders(): Promise<string[]> {
        await this.ensureSystemTableExists()

        const { Items } = await this.docClient
                                    .scan(dynamoRequests.listTablesExpression())
        return Items ? Items.map((table: { tableName?: any }) => table.tableName) : []
    }

    supportedOperations(): SchemaOperations[] {
        const { List, ListHeaders, Create, Drop, AddColumn, RemoveColumn, Describe, BulkDelete, Truncate, DeleteImmediately, UpdateImmediately } = SchemaOperations

        return [ List, ListHeaders, Create, Drop, AddColumn, RemoveColumn, Describe, BulkDelete, Truncate, DeleteImmediately, UpdateImmediately ]
    }

    async create(collectionName: string, columns: InputField[]): Promise<void> {
        await this.ensureSystemTableExists()
        validateTable(collectionName)

        const collection = await this.collectionDataFor(collectionName, true)
        if (!collection) {
            await this.insertToSystemTable(collectionName, columns)
            
            await this.client
                      .createTable(dynamoRequests.createTableExpression(collectionName))
        }
    }

    async drop(collectionName: string): Promise<void> {
        await this.ensureSystemTableExists()
        validateTable(collectionName)
        
        await this.deleteTableFromSystemTable(collectionName)

        await this.client
                  .deleteTable({ TableName: collectionName })
                  .catch(translateErrorCodes)
    }

    async addColumn(collectionName: string, column: InputField): Promise<void> {
        await this.ensureSystemTableExists()
        validateTable(collectionName)
        await validateSystemFields(column.name)
        
        const { fields } = await this.collectionDataFor(collectionName)
        if (fields.find((f: { name: any }) => f.name === column.name)) {
            throw new FieldAlreadyExists('Collection already has a field with the same name')
        }

        await this.docClient 
                  .update(dynamoRequests.addColumnExpression(collectionName, column)) 
    }

    async removeColumn(collectionName: string, columnName: string): Promise<void> {
        await this.ensureSystemTableExists()
        validateTable(collectionName)
        await validateSystemFields(columnName)

        const { fields } = await this.collectionDataFor(collectionName)

        if (!fields.some((f: { name: any }) => f.name === columnName)) {
            throw new FieldDoesNotExist('Collection does not contain a field with this name')
        }
        await this.docClient
                  .update(dynamoRequests.removeColumnExpression(collectionName, fields.filter((f: { name: any }) => f.name !== columnName)))

    }

    async describeCollection(collectionName: string): Promise<ResponseField[]> {
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

    async insertToSystemTable(collectionName: string, fields: any) {        
        await this.docClient
                   .put(dynamoRequests.insertToSystemTableExpression(collectionName, fields))
    }

    async deleteTableFromSystemTable(collectionName: string) {
        await this.docClient
                  .delete(dynamoRequests.deleteTableFromSystemTableExpression(collectionName))
    }
    
    async collectionDataFor(collectionName: string, toReturn?: boolean | undefined): Promise<any> {
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
