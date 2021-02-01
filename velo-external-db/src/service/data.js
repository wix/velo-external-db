const { asWixData, unpackDates } = require('./transform')

class DataService {
    constructor(storage) {
        this.storage = storage
    }

    async find(collectionName, filter, sort, skip, limit) {
        return {
            items: (await this.storage.find(collectionName, filter, sort, skip, limit))
                                      .map( asWixData ),
            totalCount: 0
        }
    }

    async getById(collectionName, itemId) {
        const result = await this.find(collectionName, {
            kind: 'filter',
            operator: '$eq',
            fieldName: '_id',
            value: itemId
        }, '', 0, 1)

        return { item: result.items[0] }
    }

    async count(collectionName, filter) {

        return { totalCount: 0 }
    }

    async insert(collectionName, item) {
        return this.storage.insert(collectionName, unpackDates(item))
    }

    async update(collectionName, item) {
        // return this.storage.update(collectionName, unpackDates(item))
        return { item: item }
    }

    async delete(collectionName, itemIds) {
        return this.storage.delete(collectionName, itemIds)
    }



}

module.exports = DataService


// const Storage = require('../service/storage')


// const find = async (collectionName, filter, sort, skip, limit) => {
//
// }
// exports.findItems = async (req, res) => {
//     const findResult = await Storage.find(req.body)
//
//     res.json(findResult)
// }
//
// exports.getItem = async (req, res) => {
//     const getResult = await Storage.get(req.body)
//
//     res.json(getResult)
// }
//
// exports.insertItem = async (req, res) => {
//     const insertResult = await Storage.insert(req.body)
//
//     res.json(insertResult)
// }
//
// exports.updateItem = async (req, res) => {
//     const updateResult = await Storage.update(req.body)
//
//     res.json(updateResult)
// }
//
// exports.removeItem = async (req, res) => {
//     const removeResult = await Storage.remove(req.body)
//
//     res.json(removeResult)
// }
//
// exports.countItems = async (req, res) => {
//     const countResult = await Storage.count(req.body)
//
//     res.json(countResult)
// }

// exports = { find }