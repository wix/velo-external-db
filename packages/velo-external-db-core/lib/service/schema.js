const { asWixSchema, asWixSchemaHeaders, allowedOperationsFor, appendQueryOperatorsTo } = require('velo-external-db-commons')

class SchemaService {
    constructor(storage, schemaInformation) {
        this.storage = storage
        this.schemaInformation = schemaInformation
    }

    async list() {
        const dbs = await this.storage.list()
        const schemaSupportedOperations = await this.storage.supportedOperations()
        const dbsWithAllowedOperations = this.appendAllowedOperationsTo(dbs, schemaSupportedOperations)

        return { schemas: dbsWithAllowedOperations.map( asWixSchema ) }
    }

    async listHeaders() {
        const collections = await this.storage.listHeaders()
        return { schemas: collections.map( asWixSchemaHeaders ) }
    }

    async find(collectionNames) {
        const dbs = await Promise.all(collectionNames.map(async collectionName => ({ id: collectionName, fields: await this.storage.describeCollection(collectionName) })))
        const schemaSupportedOperations = await this.storage.supportedOperations()
        const dbsWithAllowedOperations = this.appendAllowedOperationsTo(dbs, schemaSupportedOperations)

        return { schemas: dbsWithAllowedOperations.map( asWixSchema ) }
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

    appendAllowedOperationsTo(dbs, allowedSchemaOperations) {
        return dbs.map(db => ({
            ...db, 
            allowedSchemaOperations,
            allowedOperations: allowedOperationsFor(db),
            fields: appendQueryOperatorsTo(db.fields)
        }))
    }
}

module.exports = SchemaService
