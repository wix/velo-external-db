class DataProvider {
    async find(collectionName, filter, sort, skip, limit) { }

    async count(collectionName, filter) { }

    async update(collectionName, item) { }

    async insert(collectionName, item) { }
}

class SchemaProvider {
    async list() { }

    async create(collectionName) { }

    async addColumn(collectionName, column) { }

    async removeColumn(collectionName, columnName) { }
}

module.exports = {DataProvider, SchemaProvider}