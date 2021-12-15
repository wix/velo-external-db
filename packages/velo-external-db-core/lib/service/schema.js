const { asWixSchema } = require('velo-external-db-commons')

class SchemaService {
    constructor(storage, schemaInformation) {
        this.storage = storage
        this.schemaInformation = schemaInformation
    }

    async list() {
        const dbs = await this.storage.list()
        return { schemas: dbs.map(db => asWixSchema(db.fields, db.id) ) }
    }

    async find(collectionNames) {
        const dbs = await Promise.all(collectionNames.map(async collectionName => ({ id: collectionName, fields: await this.storage.describeCollection(collectionName) })))
        return { schemas: dbs.map(db => asWixSchema(db.fields, db.id) ) }
    }

    async create(collectionName) {
        await this.storage.create(collectionName)
        await this.schemaInformation.refresh()
    }

    async addColumn(collectionName, column) {
        await this.storage.addColumn(collectionName, column)
        await this.schemaInformation.refresh()
    }

    async removeColumn(collectionName, columnName) {
        await this.storage.removeColumn(collectionName, columnName)
        await this.schemaInformation.refresh()
    }
}

module.exports = SchemaService
