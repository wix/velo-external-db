class SchemaService {
    constructor(storage) {
        this.storage = storage
    }

    async list() {
        const schemas = await this.storage.list()

        return { schemas }
    }

    async find(collectionNames) {
        const schemas = await Promise.all(collectionNames.map(collectionName => this.storage.describeCollection(collectionName)))
        return { schemas }
    }

    async create(collectionName, columns) {
        return this.storage.create(collectionName, columns);
    }

    async addColumn(collectionName, column) {
        return await this.storage.addColumn(collectionName, column)
    }

    async removeColumn(collectionName, columnName) {
        return await this.storage.removeColumn(collectionName, columnName)

    }
}

module.exports = SchemaService
