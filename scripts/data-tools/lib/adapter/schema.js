
const create = async(collectionName, axios) => await axios.post('/schemas/create', { collectionName })
const createCollection = async(collectionName, axios) => await create(collectionName, axios)

const addColumn = async(collectionName, column, axios) => {
    try{
        return await axios.post('/schemas/column/add', { collectionName, column })
    }catch(e) {console.log(e)}
}

const addColumnsToCollection = async(collectionName, newColumns, axios) => {
    for (const c of newColumns) {
        await addColumn(collectionName, c, axios)
    }
}

const truncate = (collectionName, axios) => axios.post('/data/truncate', { collectionName })

module.exports = { addColumnsToCollection, createCollection, truncate }