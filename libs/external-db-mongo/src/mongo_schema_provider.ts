import { SystemFields, validateSystemFields, AllSchemaOperations, EmptyCapabilities } from '@wix-velo/velo-external-db-commons'
import { InputField, ResponseField, ISchemaProvider, SchemaOperations, Table, CollectionCapabilities } from '@wix-velo/velo-external-db-types'
const { CollectionDoesNotExists, FieldAlreadyExists, FieldDoesNotExist } = require('@wix-velo/velo-external-db-commons').errors
import { validateTable, SystemTable } from './mongo_utils'
import { CollectionOperations, FieldTypes, ReadWriteOperations, ColumnsCapabilities } from './mongo_capabilities'


export default class SchemaProvider implements ISchemaProvider {
    client: any
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
        }
    }

    async list(): Promise<Table[]> {
        await this.ensureSystemTableExists()

        const resp = await this.client.db()
                                      .collection(SystemTable)
                                      .find({})
        const l = await resp.toArray()
        const tables = l.reduce((o: any, d: { _id: string; fields: any }) => ({ ...o, [d._id]: { fields: d.fields } }), {})
        return Object.entries(tables)
                     .map(([collectionName, rs]: [string, any]) => ({
                         id: collectionName,
                         fields: [...SystemFields, ...rs.fields].map( this.reformatFields.bind(this) ),
                         capabilities: this.collectionCapabilities()
                     }))

    }

    async listHeaders(): Promise<string[]> {
        await this.ensureSystemTableExists()

        const resp = await this.client.db()
                                      .collection(SystemTable)
                                      .find({})
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
                             .insertOne( { _id: collectionName, fields: columns || [] })
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

    async describeCollection(collectionName: string): Promise<Table> {
        validateTable(collectionName)
        const collection = await this.collectionDataFor(collectionName)
        if (!collection) {
            throw new CollectionDoesNotExists('Collection does not exists')
        }
        return {
            id: collectionName,
            fields: [...SystemFields, ...collection.fields].map( this.reformatFields.bind(this) ),
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

    async collectionDataFor(collectionName: string): Promise<any> { //fixme: any
        validateTable(collectionName)
        return await this.client.db()
                                .collection(SystemTable)
                                .findOne({ _id: collectionName })
    }

    async ensureSystemTableExists(): Promise<void> {
        const systemTable = await this.client.db().listCollections({ name: SystemTable }).toArray()
        if (!systemTable.length) {
            await this.client.db().createCollection(SystemTable)
        }
    }
}
