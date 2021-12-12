const { fieldsWithoutSubType } = require ('./schema_utils')
class SchemaService {
    constructor(storage, schemaInformation) {
        this.storage = storage
        this.schemaInformation = schemaInformation
    }

    async list() {
        const schemas = await this.storage.list()
        const fixedSchemas =  schemas.map(({ fields, ...rest }) => ({
            ...rest,
            fields: fieldsWithoutSubType(fields)
        }))
        return { schemas: fixedSchemas } 

    }

    async find(collectionNames) {
        const schemas = await Promise.all(collectionNames.map(collectionName => this.storage.describeCollection(collectionName)))
        return { schemas }
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
