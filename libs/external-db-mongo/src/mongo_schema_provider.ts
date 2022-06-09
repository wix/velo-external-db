import { SystemFields, validateSystemFields, AllSchemaOperations } from '@wix-velo/velo-external-db-commons'
const { CollectionDoesNotExists, FieldAlreadyExists, FieldDoesNotExist } = require('@wix-velo/velo-external-db-commons').errors
import { validateTable, SystemTable } from './mongo_utils'

export default class SchemaProvider {
    client: any;
    constructor(client: any) {
        this.client = client
    }

    reformatFields(field: { name: any; type: any }) {
        return {
            field: field.name,
            type: field.type,
        }
    }

    async list() {
        await this.ensureSystemTableExists()

        const resp = await this.client.db()
                                      .collection(SystemTable)
                                      .find({})
        const l = await resp.toArray()
        const tables = l.reduce((o: any, d: { _id: any; fields: any }) => ({ ...o, [d._id]: { fields: d.fields } }), {})
        return Object.entries(tables)
                     .map(([collectionName, rs]) => ({
                         id: collectionName,
                         fields: [...SystemFields, ...rs.fields].map( this.reformatFields.bind(this) )
                     }))

    }

    async listHeaders() {
        await this.ensureSystemTableExists()

        const resp = await this.client.db()
                                      .collection(SystemTable)
                                      .find({})
        const data = await resp.toArray()
        return data.map((rs: { _id: any }) => rs._id)
    }

    supportedOperations() {
        return AllSchemaOperations
    }

    async create(collectionName: any, columns: any) {
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

    async addColumn(collectionName: any, column: { name: any }) {
        validateTable(collectionName)
        await validateSystemFields(column.name)

        const collection = await this.collectionDataFor(collectionName)
        if (!collection) {
            throw new CollectionDoesNotExists('Collection does not exists')
        }
        const fields = collection.fields

        if (fields.find((f: { name: any }) => f.name === column.name)) {
            throw new FieldAlreadyExists('Collection already has a field with the same name')
        }

        await this.client.db()
                         .collection(SystemTable)
                         .updateOne({ _id: collectionName },
                                    { $addToSet: { fields: column } })
    }

    async removeColumn(collectionName: any, columnName: any) {
        validateTable(collectionName)
        await validateSystemFields(columnName)

        const collection = await this.collectionDataFor(collectionName)
        if (!collection) {
            throw new CollectionDoesNotExists('Collection does not exists')
        }
        const fields = collection.fields

        if (!fields.find((f: { name: any }) => f.name === columnName)) {
            throw new FieldDoesNotExist('Collection does not contain a field with this name')
        }

        await this.client.db()
                         .collection(SystemTable)
                         .updateOne({ _id: collectionName },
                                    { $pull: { fields: { name: { $eq: columnName } } } } )
    }

    async describeCollection(collectionName: any) {
        validateTable(collectionName)
        const collection = await this.collectionDataFor(collectionName)
        if (!collection) {
            throw new CollectionDoesNotExists('Collection does not exists')
        }

        return [...SystemFields, ...collection.fields].map( this.reformatFields.bind(this) )
    }

    async drop(collectionName: any) {
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

    async collectionDataFor(collectionName: any) {
        validateTable(collectionName)
        return await this.client.db()
                                .collection(SystemTable)
                                .findOne({ _id: collectionName })
    }

    async ensureSystemTableExists() {
        const systemTable = await this.client.db().listCollections({ name: SystemTable }).toArray()
        if (!systemTable.length) {
            await this.client.db().createCollection(SystemTable)
        }
    }
}
