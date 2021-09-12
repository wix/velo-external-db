const { SystemFields, validateSystemFields, asWixSchema } = require('velo-external-db-commons')
const { CollectionDoesNotExists, FieldAlreadyExists, FieldDoesNotExist } = require('velo-external-db-commons').errors

const SystemTable = '_descriptor'

class SchemaProvider {
    constructor(client) {
        this.client = client
    }

    reformatFields(field) {
        return {
            field: field.name,
            type: field.type,
        }
    }

    async list() {
        const resp = await this.client.db().collection(SystemTable).find({})
        const l = await resp.toArray()
        const tables = l.reduce((o, d) => Object.assign( o, { [d._id]: { fields: d.fields } }), {})
        return Object.entries(tables)
                     .map(([collectionName, rs]) => asWixSchema([...SystemFields, ...rs.fields].map( this.reformatFields.bind(this) ), collectionName))
    }

    async create(collectionName, columns) {
        const collection = await this.client.db().collection(SystemTable).findOne({ _id: collectionName })
        if (!collection) {
            await this.client.db().collection(SystemTable).insertOne( { _id: collectionName, fields: columns || [] })
            await this.client.db().createCollection(collectionName)
        }
    }

    async addColumn(collectionName, column) {
        await validateSystemFields(column.name)

        const collection = await this.client.db().collection(SystemTable).findOne({ _id: collectionName })
        if (!collection) {
            throw new CollectionDoesNotExists('Collection does not exists')
        }
        const fields = collection.fields

        if (fields.find(f => f.name === column.name)) {
            throw new FieldAlreadyExists('Collection already has a field with the same name')
        }

        await this.client.db().collection(SystemTable)
                              .updateOne({ _id: collectionName }, { $set: { fields: [...fields, column] } })
    }

    async removeColumn(collectionName, columnName) {
        await validateSystemFields(columnName)

        const collection = await this.client.db().collection(SystemTable).findOne({ _id: collectionName })
        if (!collection) {
            throw new CollectionDoesNotExists('Collection does not exists')
        }
        const fields = collection.fields

        if (!fields.find(f => f.name === columnName)) {
            throw new FieldDoesNotExist('Collection does not contain a field with this name')
        }

        await this.client.db().collection(SystemTable)
                              .updateOne({ _id: collectionName }, { $set: { fields: fields.filter(f => f.name !== columnName) } })
    }

    async describeCollection(collectionName) {
        const collection = await this.client.db().collection(SystemTable).findOne({ _id: collectionName })
        if (!collection) {
            throw new CollectionDoesNotExists('Collection does not exists')
        }

        return asWixSchema([...SystemFields, ...collection.fields].map( this.reformatFields.bind(this) ), collectionName)
    }

    async drop(collectionName) {
        const d = await this.client.db().collection(SystemTable).deleteOne( { _id: collectionName })
        if (d.deletedCount === 1) {
            await this.client.db().collection(collectionName).drop()
                             .catch(e => console.log(e))
        }
    }
}


module.exports = SchemaProvider