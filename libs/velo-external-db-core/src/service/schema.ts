import { asWixSchema, asWixSchemaHeaders, allowedOperationsFor, appendQueryOperatorsTo, SchemaOperations, errors } from '@wix-velo/velo-external-db-commons'
import { InputField, ISchemaProvider, Table } from '@wix-velo/velo-external-db-types'
import CacheableSchemaInformation from './schema_information'
const { Create, AddColumn, RemoveColumn } = SchemaOperations

export default class SchemaService {
    storage: ISchemaProvider
    schemaInformation: CacheableSchemaInformation
    constructor(storage: any, schemaInformation: any) {
        this.storage = storage
        this.schemaInformation = schemaInformation
    }

    async list() {
        const dbs = await this.storage.list()
        const dbsWithAllowedOperations = this.appendAllowedOperationsTo(dbs)

        return { schemas: dbsWithAllowedOperations.map( asWixSchema ) }
    }

    async listHeaders() {
        const collections = await this.storage.listHeaders()
        return { schemas: collections.map((collection) => asWixSchemaHeaders(collection)) }
    }

    async find(collectionNames: string[]) {
        const dbs: Table[] = await Promise.all(collectionNames.map(async(collectionName: string) => ({ id: collectionName, fields: await this.schemaInformation.schemaFieldsFor(collectionName) })))
        const dbsWithAllowedOperations = this.appendAllowedOperationsTo(dbs)

        return { schemas: dbsWithAllowedOperations.map( asWixSchema ) }
    }

    async create(collectionName: string) {
        await this.validateOperation(Create)
        await this.storage.create(collectionName)
        await this.schemaInformation.refresh()
        return {}
    }

    async addColumn(collectionName: string, column: InputField) {
        await this.validateOperation(AddColumn)
        await this.storage.addColumn(collectionName, column)
        await this.schemaInformation.refresh()
        return {}
    }

    async removeColumn(collectionName: string, columnName: string) {
        await this.validateOperation(RemoveColumn)
        await this.storage.removeColumn(collectionName, columnName)
        await this.schemaInformation.refresh()
        return {}
    }

    appendAllowedOperationsTo(dbs: Table[]) {
        const allowedSchemaOperations = this.storage.supportedOperations()
        return dbs.map((db: Table) => ({
            ...db,
            allowedSchemaOperations,
            allowedOperations: allowedOperationsFor(db),
            fields: appendQueryOperatorsTo(db.fields)
        }))
    }

    
    async validateOperation(operationName: SchemaOperations) {
        const allowedSchemaOperations = this.storage.supportedOperations()

        if (!allowedSchemaOperations.includes(operationName)) 
            throw new errors.UnsupportedOperation(`You database doesn't support ${operationName} operation`)
    }

}
