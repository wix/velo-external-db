const { asWixData } = require('./transform')

class DataService {
    constructor(storage) {
        this.storage = storage
    }

    async find(collectionName, filter, sort, skip, limit) {
        return {
            items: (await this.storage.list(collectionName, filter, sort, skip, limit))
                                      .map( asWixData ),
            totalCount: 0
        }
    }

    async getById(collectionName, itemId) {

    }

    async count(collectionName, filter) {

    }

    async insert(collectionName, item) {

    }

    async update(collectionName, item) {

    }

    async delete(collectionName, itemId) {

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