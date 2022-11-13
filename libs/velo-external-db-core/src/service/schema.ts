import { asWixSchema, asWixSchemaHeaders, allowedOperationsFor, appendQueryOperatorsTo, errors } from '@wix-velo/velo-external-db-commons'
import { InputField, ISchemaProvider, Table, SchemaOperations, ResponseField } from '@wix-velo/velo-external-db-types'
import { Collection, CollectionCapabilities, Field, FieldCapabilities, ListCollectionsResponsePart } from '../spi-model/collection'
import { convertQueriesToQueryOperatorsEnum, convertFieldTypeToEnum } from '../utils/schema_utils'
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

    async listCollections(collectionIds: string[]): Promise<ListCollectionsResponsePart> {

        let collections: Table[]
        
        if (collectionIds.length === 0) {
            collections = await this.storage.list()
        } else  {
            collections = await Promise.all(collectionIds.map(async(collectionName: string) => ({ id: collectionName, fields: await this.schemaInformation.schemaFieldsFor(collectionName) })))
        }
        
        const collectionAfterFormat: Collection[] = collections.map((collection) => ({
            id: collection.id,
            fields: this.formatFields(collection.fields),
            capabilities: this.getCollectionCapabilities()
        }))

        return { collection: collectionAfterFormat }

    }

    formatFields(fields: ResponseField[]): Field[] {

        const getFieldCapabilities = (type: string): FieldCapabilities => {
            const { sortable, columnQueryOperators } = this.storage.getColumnCapabilitiesFor(type)
            return {
                sortable,
                queryOperators: convertQueriesToQueryOperatorsEnum(columnQueryOperators)
            }
        }

        return fields.map((field) => ({
            key: field.field,
            // TODO: think about how to implement this
            encrypted: false,
            type: convertFieldTypeToEnum(field.type),
            capabilities: getFieldCapabilities(field.type)
        }))
    }

    getCollectionCapabilities(): CollectionCapabilities {
        return {
            dataOperations: [],
            fieldTypes: [],
            collectionOperations: [],
        }
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
            throw new errors.UnsupportedOperation(`Your database doesn't support ${operationName} operation`)
    }

}
