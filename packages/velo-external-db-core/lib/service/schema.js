const { asWixSchema, asWixSchemaHeaders } = require('velo-external-db-commons')

class SchemaService {
    constructor(storage, schemaInformation) {
        this.storage = storage
        this.schemaInformation = schemaInformation
    }

    async list() {
        const dbs = await this.storage.list()
        return { schemas: dbs.map( asWixSchema ) }
    }

    async listHeaders() {
        const collections = await this.storage.listHeaders()
        return { schemas: collections.map( asWixSchemaHeaders ) }
    }

    async find(collectionNames) {
        const dbs = await Promise.all(collectionNames.map(async collectionName => ({ id: collectionName, fields: await this.storage.describeCollection(collectionName) })))
        return { schemas: dbs.map( asWixSchema ) }
    }

    async create(collectionName) {
        await this.storage.create(collectionName)
        await this.schemaInformation.refresh()
        return {}
    }

    async addColumn(collectionName, column) {
        await this.storage.addColumn(collectionName, column)
        await this.schemaInformation.refresh()
        return {}
    }

    async removeColumn(collectionName, columnName) {
        await this.storage.removeColumn(collectionName, columnName)
        await this.schemaInformation.refresh()
        return {}
    }

    async supportedOperations() {
        return this.storage.supportedOperations()
    }
}

module.exports = SchemaService
