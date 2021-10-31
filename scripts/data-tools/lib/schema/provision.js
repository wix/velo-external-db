
const addColumn = (collectionName, column, axios) => axios.post('/schemas/column/add', { collectionName, column })
const create = async (collectionName, axios) => await axios.post('/schemas/create', { collectionName })

const createCollection = async(collectionName, axios) => {
    console.log('Creating new collection ...')
    try {
        await create(collectionName, axios)
        console.log('The collection was created successfully')
    } catch (error) {
        console.log(`Error creating new collection: ${error.response.data.message}`)
    }
}

const addColumnsToCollection = async(collectionName, newColumns, axios) => {
    console.log('Adding new columns to the collection ...')
    try {
        await Promise.all(newColumns.map(column => addColumn(collectionName, column, axios)))
        console.log('The columns were added successfully')
    } catch (error) {
        console.log(`Error adding new columns: ${error.response.data.message}`)
    }
}

module.exports = { addColumnsToCollection, createCollection }