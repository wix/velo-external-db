import { errors } from '@wix-velo/velo-external-db-commons'
import { ISchemaProvider, 
    SchemaOperations, 
    ResponseField, 
    DbCapabilities, 
    Table 
} from '@wix-velo/velo-external-db-types'
import * as collectionSpi from '../spi-model/collection'
import CacheableSchemaInformation from './schema_information'
import { 
    queriesToWixDataQueryOperators, 
    fieldTypeToWixDataEnum, 
    WixFormatFieldsToInputFields, 
    responseFieldToWixFormat, 
    compareColumnsInDbAndRequest 
} from '../utils/schema_utils'


const { Create, AddColumn, RemoveColumn, ChangeColumnType } = SchemaOperations

export default class SchemaService {
    storage: ISchemaProvider
    schemaInformation: CacheableSchemaInformation
    constructor(storage: any, schemaInformation: any) {
        this.storage = storage
        this.schemaInformation = schemaInformation
    }

    async list(collectionIds: string[]): Promise<collectionSpi.ListCollectionsResponsePart> {        
        const collections = (!collectionIds || collectionIds.length === 0) ? 
            await this.storage.list() : 
            await Promise.all(collectionIds.map(async(collectionName: string) => ({ id: collectionName, fields: await this.schemaInformation.schemaFieldsFor(collectionName) })))
                
        return { 
            collection: collections.map(this.formatCollection.bind(this))
        }
    }

    async create(collection: collectionSpi.Collection): Promise<collectionSpi.CreateCollectionResponse> {                
        await this.storage.create(collection.id, WixFormatFieldsToInputFields(collection.fields))
        await this.schemaInformation.refresh()
        return { collection }
    }

    async update(collection: collectionSpi.Collection): Promise<collectionSpi.UpdateCollectionResponse> {
        await this.validateOperation(Create)
        
        // remove in the end of development
        if (!this.storage.changeColumnType) {
            throw new Error('Your storage does not support the new collection capabilities API')
        }

        const collectionColumnsInRequest = collection.fields
        const collectionColumnsInDb = await this.storage.describeCollection(collection.id)

        const {
            columnsToAdd,
            columnsToRemove,
            columnsToChangeType
        } = compareColumnsInDbAndRequest(collectionColumnsInDb, collectionColumnsInRequest)

        // Adding columns
        if (columnsToAdd.length > 0) {
            await this.validateOperation(AddColumn)
        }
        await Promise.all(columnsToAdd.map(async(field) => await this.storage.addColumn(collection.id, field)))
        
        // Removing columns
        if (columnsToRemove.length > 0) {
            await this.validateOperation(RemoveColumn)
        }
        await Promise.all(columnsToRemove.map(async(fieldName) => await this.storage.removeColumn(collection.id, fieldName)))

        // Changing columns type
        if (columnsToChangeType.length > 0) {
            await this.validateOperation(ChangeColumnType)
        }
        await Promise.all(columnsToChangeType.map(async(field) => await this.storage.changeColumnType!(collection.id, field)))

        await this.schemaInformation.refresh()

        return { collection }
    }

    async delete(collectionId: string): Promise<collectionSpi.DeleteCollectionResponse> {
        const collectionFields = await this.storage.describeCollection(collectionId)
        await this.storage.drop(collectionId)
        await this.schemaInformation.refresh()
        return { collection: {
            id: collectionId,
            fields: responseFieldToWixFormat(collectionFields),
        } }
    }

    private async validateOperation(operationName: SchemaOperations) {
        const allowedSchemaOperations = this.storage.supportedOperations()

        if (!allowedSchemaOperations.includes(operationName)) 
            throw new errors.UnsupportedOperation(`Your database doesn't support ${operationName} operation`)
    }

    private formatCollection(collection: Table): collectionSpi.Collection {
        // remove in the end of development
        if (!this.storage.capabilities || !this.storage.columnCapabilitiesFor) {
            throw new Error('Your storage does not support the new collection capabilities API')
        }
        const capabilities = this.formatCollectionCapabilities(this.storage.capabilities())
        return {
            id: collection.id,
            fields: this.formatFields(collection.fields),
            capabilities
        }
    }

    private formatFields(fields: ResponseField[]): collectionSpi.Field[] {
        const fieldCapabilitiesFor = (type: string): collectionSpi.FieldCapabilities => {
            // remove in the end of development
            if (!this.storage.columnCapabilitiesFor) {
                throw new Error('Your storage does not support the new collection capabilities API')
            }
            const { sortable, columnQueryOperators } = this.storage.columnCapabilitiesFor(type)
            return {
                sortable,
                queryOperators: queriesToWixDataQueryOperators(columnQueryOperators)
            }
        }

        return fields.map((f) => ({
            key: f.field,
            // TODO: think about how to implement this
            encrypted: false,
            type: fieldTypeToWixDataEnum(f.type),
            capabilities: fieldCapabilitiesFor(f.type)
        }))
    }

    private formatCollectionCapabilities(capabilities: DbCapabilities): collectionSpi.CollectionCapabilities {
        return {
            dataOperations: capabilities.dataOperations as unknown as collectionSpi.DataOperation[],
            fieldTypes: capabilities.fieldTypes as unknown as collectionSpi.FieldType[],
            collectionOperations: capabilities.collectionOperations as unknown as collectionSpi.CollectionOperation[],
        }
    }

}
