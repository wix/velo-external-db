import { MongoClient } from 'mongodb'
import { validateSystemFields, AllSchemaOperations, EmptyCapabilities, errors } from '@wix-velo/velo-external-db-commons'
import { InputField, ResponseField, ISchemaProvider, SchemaOperations, Table, CollectionCapabilities, Encryption, PagingMode } from '@wix-velo/velo-external-db-types'
import { validateTable, SystemTable, updateExpressionFor, CollectionObject } from './mongo_utils'
import { CollectionOperations, FieldTypes, ReadWriteOperations, ColumnsCapabilities } from './mongo_capabilities'
const { CollectionDoesNotExists, FieldAlreadyExists, FieldDoesNotExist } = errors


export default class SchemaProvider implements ISchemaProvider {
    client: MongoClient
    constructor(client: any) {
        this.client = client
    }

    reformatFields(field: {name: string, type: string}): ResponseField {
        return {
            field: field.name,
            type: field.type,
            capabilities: ColumnsCapabilities[field.type as keyof typeof ColumnsCapabilities] ?? EmptyCapabilities
        }
    }

    private collectionCapabilities(): CollectionCapabilities {
        return {
            dataOperations: ReadWriteOperations,
            fieldTypes: FieldTypes,
            collectionOperations: CollectionOperations,
            encryption: Encryption.notSupported,
            indexing: [],
            referenceCapabilities: { supportedNamespaces: [] },
            pagingMode: PagingMode.offset
        } 
    }

    async list(): Promise<Table[]> {
        await this.ensureSystemTableExists()

        const resp = await this.client.db()
                                      .collection(SystemTable)
                                      .find<CollectionObject>({})
        const l = await resp.toArray()
        const tables = l.reduce((o: any, d: { _id: string; fields: any }) => ({ ...o, [d._id]: { fields: d.fields } }), {})
        return Object.entries(tables)
                     .map(([collectionName, rs]: [string, any]) => ({
                         id: collectionName,
                         fields: rs.fields.map( this.reformatFields.bind(this) ),
                         capabilities: this.collectionCapabilities()
                     }))

    }

    async listHeaders(): Promise<string[]> {
        await this.ensureSystemTableExists()

        const resp = await this.client.db()
                                      .collection(SystemTable)
                                      .find<CollectionObject>({})
        const data = await resp.toArray()
        return data.map((rs: { _id: string }) => rs._id)
    }

    supportedOperations(): SchemaOperations[] {
        return AllSchemaOperations
    }

    async create(collectionName: string, columns: InputField[]): Promise<void> {
        validateTable(collectionName)
        const collection = await this.collectionDataFor(collectionName)
        if (!collection) {
            await this.client.db()
                             .collection(SystemTable)
                             .insertOne({ _id: collectionName as any, fields: columns || [] })
            await this.client.db()
                             .createCollection(collectionName)
        }
    }

    async addColumn(collectionName: string, column: InputField): Promise<void> {
        validateTable(collectionName)
        await validateSystemFields(column.name)

        const collection = await this.collectionDataFor(collectionName)
        if (!collection) {
            throw new CollectionDoesNotExists('Collection does not exists')
        }
        const fields = collection.fields

        if (fields.find((f: InputField) => f.name === column.name)) {
            throw new FieldAlreadyExists('Collection already has a field with the same name')
        }

        await this.client.db()
                         .collection(SystemTable)
                         .updateOne({ _id: collectionName },
                                    { $addToSet: { fields: column } })
    }

    async removeColumn(collectionName: string, columnName: string): Promise<void> {
        validateTable(collectionName)
        await validateSystemFields(columnName)

        const collection = await this.collectionDataFor(collectionName)
        if (!collection) {
            throw new CollectionDoesNotExists('Collection does not exists')
        }
        const fields = collection.fields

        if (!fields.find((f: InputField) => f.name === columnName)) {
            throw new FieldDoesNotExist('Collection does not contain a field with this name')
        }

        await this.client.db()
                         .collection(SystemTable)
                         .updateOne({ _id: collectionName },
                                    { $pull: { fields: { name: { $eq: columnName } } } } )
    }

    async changeColumnType(collectionName: string, column: InputField): Promise<void> {
        const collection = await this.collectionDataFor(collectionName)

        if (!collection) {
            throw new CollectionDoesNotExists('Collection does not exists')
        }
        
        await this.client.db()
                         .collection(SystemTable)
                         .bulkWrite(updateExpressionFor([{ 
                            _id: collection._id,
                            fields: [...collection.fields.filter((f: InputField) => f.name !== column.name), column] 
                        }]))

    }

    async describeCollection(collectionName: string): Promise<Table> {
        validateTable(collectionName)
        const collection = await this.collectionDataFor(collectionName)
        if (!collection) {
            throw new CollectionDoesNotExists('Collection does not exists', collectionName)
        }
        return {
            id: collectionName,
            fields: collection.fields.map( this.reformatFields.bind(this) ),
            capabilities: this.collectionCapabilities()
        }
    }

    async drop(collectionName: string): Promise<void> {
        validateTable(collectionName)
        const d = await this.client.db()
                                   .collection(SystemTable)
                                   .deleteOne( { _id: collectionName })
        if (d.deletedCount === 1) {
            await this.client.db()
                             .collection(collectionName)
                             .drop()
        }
    }

    async collectionDataFor(collectionName: string) {
        validateTable(collectionName)
        return await this.client.db()
                                .collection(SystemTable)
                                .findOne<CollectionObject>({ _id: collectionName })
    }

    async ensureSystemTableExists(): Promise<void> {
        const systemTable = await this.client.db().listCollections({ name: SystemTable }).toArray()
        if (!systemTable.length) {
            await this.client.db().createCollection(SystemTable)
        }
    }
}
