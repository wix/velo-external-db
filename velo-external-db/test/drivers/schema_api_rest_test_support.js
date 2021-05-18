const {expect} = require('chai')
const axios = require('axios').create({
    baseURL: 'http://localhost:8080'
});


const givenCollection = async (name, columns, auth) => {
    await axios.post(`/schemas/create`, {collectionName: name}, auth)
    await Promise.all( columns.map(async column => await axios.post(`/schemas/column/add`, {collectionName: name, column: column}, auth)) )
}

const expectColumnInCollection = async (columnName, collectionName, auth) => {
    const dbs = (await axios.post(`/schemas/list`, {}, auth)).data.schemas
    const field = dbs.find(e => e.id === collectionName)
                     .fields[columnName]
    return field
}

const expectDefaultCollectionWith = (collectionName, res) => {
    expect(res.data).to.be.deep.eql({ schemas: [{ id: collectionName,
            displayName: collectionName,
            allowedOperations: [
                "get",
                "find",
                "count",
                "update",
                "insert",
                "remove"
            ],
            maxPageSize: 50,
            ttl: 3600,
            fields: {
                _id: {
                    displayName: '_id',
                    type: 'text',
                    queryOperators: [
                        "eq",
                        "lt",
                        "gt",
                        "hasSome",
                        "and",
                        "lte",
                        "gte",
                        "or",
                        "not",
                        "ne",
                        "startsWith",
                        "endsWith"
                    ]
                },
                _createdDate: {
                    displayName: '_createdDate',
                    type: 'datetime',
                    queryOperators: [
                        "eq",
                        "lt",
                        "gt",
                        "hasSome",
                        "and",
                        "lte",
                        "gte",
                        "or",
                        "not",
                        "ne",
                        "startsWith",
                        "endsWith"
                    ]
                },
                _updatedDate: {
                    displayName: '_updatedDate',
                    type: 'datetime',
                    queryOperators: [
                        "eq",
                        "lt",
                        "gt",
                        "hasSome",
                        "and",
                        "lte",
                        "gte",
                        "or",
                        "not",
                        "ne",
                        "startsWith",
                        "endsWith"
                    ]
                },
                _owner: {
                    displayName: '_owner',
                    type: 'text',
                    queryOperators: [
                        "eq",
                        "lt",
                        "gt",
                        "hasSome",
                        "and",
                        "lte",
                        "gte",
                        "or",
                        "not",
                        "ne",
                        "startsWith",
                        "endsWith"
                    ]
                },
            }
        }]})

}

module.exports = { givenCollection, expectColumnInCollection, expectDefaultCollectionWith }