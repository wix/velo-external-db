const { randomEntity } = require('../generator/data')

const insert = async(items, collectionName, axios) => {
    await axios.post('/data/insert/bulk', { collectionName, items })
               .catch(error => console.log(`Error adding chunk: ${error.message}`))
}

const insertChunk = async(count, columns, collectionName, axios) => {
    const items = [...Array(count)].map(() => randomEntity(columns))
    await insert(items, collectionName, axios)
}

module.exports = { insertChunk }