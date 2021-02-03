const axios = require('axios').create({
    baseURL: 'http://localhost:8080'
});


const givenCollection = async (name, columns) => {
    await axios.post(`/schemas/create`, {collectionName: name})
    await Promise.all( columns.map(async column => await axios.post(`/schemas/column/add`, {collectionName: name, column: column})) )
}

const expectColumnInCollection = async (columnName, collectionName) => {
    const dbs = (await axios.post(`/schemas/list`, {})).data
    const field = dbs.find(e => e.id === collectionName)
        .fields.find(e => e.name === columnName)
    return field
}

module.exports = { givenCollection, expectColumnInCollection }