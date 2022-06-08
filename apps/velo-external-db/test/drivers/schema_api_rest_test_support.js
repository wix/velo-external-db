const axios = require('axios').create({
    baseURL: 'http://localhost:8080'
})

const givenCollection = async(name, columns, auth) => {
    await axios.post('/schemas/create', { collectionName: name }, auth)
    for (const column of columns) {
        await axios.post('/schemas/column/add', { collectionName: name, column: column }, auth)
    }
}

const retrieveSchemaFor = async(collectionName, auth) => axios.post('/schemas/find', { schemaIds: [collectionName] }, auth)

module.exports = { givenCollection, retrieveSchemaFor }