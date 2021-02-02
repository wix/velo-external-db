class DataProvider {
    constructor() {

    }

    async find(collectionName, filter, sort, skip, limit) { }

    async count(collectionName, filter) { }

    async update(collectionName, item) { }

    async insert(collectionName, item) { }
}

module.exports = DataProvider