class SchemaService {
    constructor(storage) {
        this.storage = storage
    }

    async list() {
        return await this.storage.list()
    }

    async create(collectionName) {
        return this.storage.create(collectionName);
    }

    async addColumn(collectionName, column) {
        return await this.storage.addColumn(collectionName, column)
    }

    async removeColumn(collectionName, columnName) {
        return await this.storage.removeColumn(collectionName, columnName)

    }
}

module.exports = SchemaService
