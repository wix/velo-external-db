
const create = async (collectionName, axios) => await axios.post('/schemas/create', { collectionName })
const createCollection = async (collectionName, axios) => await create(collectionName, axios)

const addColumn = (collectionName, column, axios) => axios.post('/schemas/column/add', { collectionName, column })
const addColumnsToCollection = async(collectionName, newColumns, axios) => await Promise.all(newColumns.map(column => addColumn(collectionName, column, axios)))

module.exports = { addColumnsToCollection, createCollection }