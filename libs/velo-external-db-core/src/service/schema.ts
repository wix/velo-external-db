import { asWixSchema, asWixSchemaHeaders, allowedOperationsFor, appendQueryOperatorsTo, errors } from '@wix-velo/velo-external-db-commons'
import { InputField, ISchemaProvider, Table, SchemaOperations, ResponseField, DbCapabilities } from '@wix-velo/velo-external-db-types'
import { Collection, CollectionCapabilities, CollectionOperation, DataOperation, Field, FieldCapabilities, FieldType, ListCollectionsResponsePart } from '../spi-model/collection'
import { convertQueriesToQueryOperatorsEnum, convertFieldTypeToEnum, convertEnumToFieldType } from '../utils/schema_utils'
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
            throw new errors.UnsupportedOperation(`Your database doesn't support ${operationName} operation`)
    }

    async listCollections(collectionIds: string[]): Promise<ListCollectionsResponsePart> {
        const collections = collectionIds.length === 0 ? 
            await this.storage.list() : 
            await Promise.all(collectionIds.map(async(collectionName: string) => ({ id: collectionName, fields: await this.schemaInformation.schemaFieldsFor(collectionName) })))
                
        const capabilities = this.formatCollectionCapabilities(this.storage.capabilities())
        const collectionAfterFormat: Collection[] = collections.map((collection) => ({
            id: collection.id,
            fields: this.formatFields(collection.fields),
            capabilities
        }))

        return { collection: collectionAfterFormat }
    }

    formatFields(fields: ResponseField[]): Field[] {
        const getFieldCapabilities = (type: string): FieldCapabilities => {
            const { sortable, columnQueryOperators } = this.storage.columnCapabilitiesFor(type)
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

    formatCollectionCapabilities(capabilities: DbCapabilities): CollectionCapabilities {
        return {
            dataOperations: capabilities.dataOperations as unknown as DataOperation[],
            fieldTypes: capabilities.fieldTypes as unknown as FieldType[],
            collectionOperations: capabilities.collectionOperations as unknown as CollectionOperation[],
        }
    }

    async createCollection(collection: Collection) {                
        await this.validateOperation(Create)
        
        const columns = collection.fields?.map((field) => ({
            name: field.key,
            type: convertEnumToFieldType(field.type),
        }))

        await this.storage.create(collection.id, columns)
        await this.schemaInformation.refresh()
        return collection
    }

    async deleteCollection(collectionId: string) {
        const collectionFields = await this.storage.describeCollection(collectionId)
        const collectionFieldsNames = collectionFields.map(f => ({
            key: f.field,
            type: convertFieldTypeToEnum(f.type)
        }))
        await this.storage.drop(collectionId)
        return { collection: {
            id: collectionId,
            fields: collectionFieldsNames,
        } }
    }

    async updateCollection(collection: Collection) {
        await this.validateOperation(Create)
        const collectionFieldsInDb = await this.storage.describeCollection(collection.id)
        const collectionFieldsInDbNames = collectionFieldsInDb.map(f => f.field)
        const collectionFieldsInRequestNames = collection.fields.map(f => f.key) 
        const columnsToAdd = collection.fields.filter(f => !collectionFieldsInDbNames.includes(f.key))
        const columnsToRemove = collectionFieldsInDb.filter(f => !collectionFieldsInRequestNames.includes(f.field))
        const columnsToChangeType = collection.fields.filter(f => {
            const fieldInDb = collectionFieldsInDb.find(field => field.field === f.key)
            return fieldInDb && fieldInDb.type !== convertEnumToFieldType(f.type)
        })


        await Promise.all(columnsToAdd.map(async(field) => await this.storage.addColumn(collection.id, {
            name: field.key as string,
            type: convertEnumToFieldType(field.type)
        })))

        await Promise.all(columnsToRemove.map(async(field) => await this.storage.removeColumn(collection.id, field.field)))

        await Promise.all(columnsToChangeType.map(async(field) => await this.storage.changeColumnType(collection.id, {
            name: field.key,
            type: convertEnumToFieldType(field.type)
        })))

    }
}
