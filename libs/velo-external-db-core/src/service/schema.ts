import { PrimaryKeyFieldName, errors } from '@wix-velo/velo-external-db-commons'
import { ISchemaProvider, 
    SchemaOperations, 
    ResponseField, 
    CollectionCapabilities, 
    Table 
} from '@wix-velo/velo-external-db-types'
import * as collectionSpi from '../spi-model/collection'
import CacheableSchemaInformation from './schema_information'
import { 
    queriesToWixDataQueryOperators, 
    fieldTypeToWixDataEnum, 
    WixFormatFieldsToInputFields, 
    responseFieldToWixFormat, 
    compareColumnsInDbAndRequest,
    dataOperationsToWixDataQueryOperators,
    pagingModeToWixDataPagingMode,
} from '../utils/schema_utils'


const { Create, AddColumn, RemoveColumn, ChangeColumnType } = SchemaOperations

export default class SchemaService {
    storage: ISchemaProvider
    schemaInformation: CacheableSchemaInformation
    constructor(storage: any, schemaInformation: any) {
        this.storage = storage
        this.schemaInformation = schemaInformation
    }

    async list(collectionIds: string[]):  Promise<{collections: collectionSpi.Collection[]}> {    
        const collections = (!collectionIds || collectionIds.length === 0) ? 
            await this.storage.list() : 
            await Promise.all(collectionIds.map((collectionName: string) => this.schemaInformation.schemaFor(collectionName)))

                return { collections: collections.map(this.formatCollection.bind(this)) }
    }

    async create(collection: collectionSpi.Collection): Promise<collectionSpi.CreateCollectionResponse> {   
        this.validateFields(collection.fields)
        await this.storage.create(collection.id, WixFormatFieldsToInputFields(collection.fields))
        await this.schemaInformation.refresh()
        return { collection }
    }

    async update(collection: collectionSpi.Collection): Promise<collectionSpi.UpdateCollectionResponse> {
        await this.validateOperation(collection.id, Create)
        
        // remove in the end of development
        if (!this.storage.changeColumnType) {
            throw new Error('Your storage does not support the new collection capabilities API')
        }

        const collectionColumnsInRequest = collection.fields
        const { fields: collectionColumnsInDb } = await this.storage.describeCollection(collection.id) as Table
        
        const {
            columnsToAdd,
            columnsToRemove,
            columnsToChangeType
        } = compareColumnsInDbAndRequest(collectionColumnsInDb, collectionColumnsInRequest)

        // Adding columns
        if (columnsToAdd.length > 0) {
            await this.validateOperation(collection.id, AddColumn)
        }
        await Promise.all(columnsToAdd.map(async(field) => await this.storage.addColumn(collection.id, field)))
        
        // Removing columns
        if (columnsToRemove.length > 0) {
            await this.validateOperation(collection.id, RemoveColumn)
        }
        await Promise.all(columnsToRemove.map(async(fieldName) => await this.storage.removeColumn(collection.id, fieldName)))

        // Changing columns type
        if (columnsToChangeType.length > 0) {
            await this.validateOperation(collection.id, ChangeColumnType)
        }
        await Promise.all(columnsToChangeType.map(async(field) => await this.storage.changeColumnType?.(collection.id, field)))

        await this.schemaInformation.refresh()

        return { collection }
    }

    async delete(collectionId: string): Promise<collectionSpi.DeleteCollectionResponse> {
        const { fields: collectionFields } = await this.storage.describeCollection(collectionId) as Table
        await this.storage.drop(collectionId)
        await this.schemaInformation.refresh()
        return { collection: {
            id: collectionId,
            fields: responseFieldToWixFormat(collectionFields),
            pagingMode: collectionSpi.PagingMode.offset
        } }
    }

    private async validateOperation(collectionName: string, operationName: SchemaOperations) {
        const allowedSchemaOperations = this.storage.supportedOperations()

        if (!allowedSchemaOperations.includes(operationName)) 
            throw new errors.UnsupportedSchemaOperation(`Your database doesn't support ${operationName} operation`, collectionName, operationName)
    }

    private validateFields(fields: collectionSpi.Field[]) {
        const fieldsName = fields.map(field => field.key)
        if (!fieldsName.includes(PrimaryKeyFieldName)) {
        throw new errors.InvalidRequest(`${PrimaryKeyFieldName} field is missing`)
        }
    }

    private formatCollection(collection: Table): collectionSpi.Collection {
        return {
            id: collection.id,
            fields: this.formatFields(collection.fields),
            capabilities: collection.capabilities? this.formatCollectionCapabilities(collection.capabilities) : undefined,
            pagingMode: pagingModeToWixDataPagingMode(collection.capabilities!.pagingMode)
        }
    }

    private formatFields(fields: ResponseField[]): collectionSpi.Field[] {
        return fields.map( field => ({
            key: field.field,
            type: fieldTypeToWixDataEnum(field.type),
            capabilities: {
                sortable: field.capabilities? field.capabilities.sortable: undefined, 
                queryOperators: field.capabilities? queriesToWixDataQueryOperators(field.capabilities.columnQueryOperators): undefined
            }
        }))
    }

    private formatCollectionCapabilities(capabilities: CollectionCapabilities): collectionSpi.CollectionCapabilities {
        return {
            dataOperations: capabilities.dataOperations.map(dataOperationsToWixDataQueryOperators),
        }
    }

}
