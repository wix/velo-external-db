class DataProvider {
    constructor() {

    }

    async list(collectionName, filter, sort, skip, limit) {
        return [{
            _id: 'stub'
        }]
    }
}

module.exports = DataProvider