class DataProvider {
    constructor() {

    }

    async find(collectionName, filter, sort, skip, limit) {
        return [{
            _id: 'stub'
        }]
    }
}

module.exports = DataProvider