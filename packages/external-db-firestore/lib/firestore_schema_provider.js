const { SystemFields, validateSystemFields, asWixSchema } = require('velo-external-db-commons')
const { CollectionDoesNotExists, FieldAlreadyExists, FieldDoesNotExist } = require('velo-external-db-commons').errors

const SystemTable = '_descriptor'

class SchemaProvider {
    constructor(database) {
        this.database = database
    }

    reformatFields(field) {
        return {
            field: field.name,
            type: field.type,
        }
    }

    async list() {
        const l = await this.database.collection(SystemTable).get()
        const tables = l.docs.reduce((o, d) => Object.assign( o, { [d.id]: d.data()}), {})
        return Object.entries(tables)
                     .map(([collectionName, rs]) => asWixSchema([...SystemFields, ...rs.fields].map( this.reformatFields.bind(this) ), collectionName))
    }

    async create(collectionName, columns) {
        const coll = await this.database.collection(SystemTable)
                                        .doc(collectionName)
                                        .get()
        if (!coll.exists) {
            await this.database.collection(SystemTable)
                               .doc(collectionName)
                               .set({
                                   id: collectionName,
                                   fields: columns || []
                               })
        }
    }

    async addColumn(collectionName, column) {
        await validateSystemFields(column.name)

        const coll = await this.database.collection(SystemTable)
                           .doc(collectionName)

        const collection = await coll.get()

        if (!collection.exists) {
            throw new CollectionDoesNotExists('Collection does not exists')
        }
        const fields = collection.data().fields

        if (fields.find(f => f.name === column.name)) {
            throw new FieldAlreadyExists('Collection already has a field with the same name')
        }

        await coll.update({
            fields: [...fields, column]
        }, { merge: true })
    }

    async removeColumn(collectionName, columnName) {
        await validateSystemFields(columnName)

        const coll = await this.database.collection(SystemTable)
                                        .doc(collectionName)

        const collection = await coll.get()

        if (!collection.exists) {
            throw new CollectionDoesNotExists('Collection does not exists')
        }
        const fields = collection.data().fields

        if (!fields.find(f => f.name === columnName)) {
            throw new FieldDoesNotExist('Collection does not contain a field with this name')
        }

        await coll.update({
            fields: fields.filter(f => f.name !== columnName)
        }, { merge: true })
    }

    async describeCollection(collectionName) {
        const collection = await this.database.collection(SystemTable)
                                              .doc(collectionName)
                                              .get()
        if (!collection.exists) {
            throw new CollectionDoesNotExists('Collection does not exists')
        }

        return asWixSchema([...SystemFields, ...collection.data().fields].map( this.reformatFields.bind(this) ), collectionName)
    }

    async drop(collectionName) {
        // todo: drop collection https://firebase.google.com/docs/firestore/manage-data/delete-data
        await this.database.collection(SystemTable).doc(collectionName).delete();
    }
}


module.exports = SchemaProvider