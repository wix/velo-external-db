
const SystemTable = '_descriptor'
const SystemFields = [
    {
        name: '_id', type: 'text', subtype: 'string', precision: '50', isPrimary: true
    },
    {
        name: '_createdDate', type: 'datetime', subtype: 'datetime'
    },
    {
        name: '_updatedDate', type: 'datetime', subtype: 'datetime'
    },
    {
        name: '_owner', type: 'text', subtype: 'string', precision: '50'
    }
]

const createCollection = async(collectionName, extraColumns, mongoClient) => {
    try {
        await mongoClient.collection(SystemTable).insertOne({ _id: collectionName, fields: [...SystemFields, ...extraColumns] })
    } catch (e) {
        return Promise.reject(`${collectionName} exists in the ${SystemTable} table. Please use the truncate option to delete the collection.`)
    }
}

const truncate = async(collectionName, mongoClient) => {
    await mongoClient.collection(collectionName).deleteMany({})
    await mongoClient.collection('_descriptor').deleteOne({ _id: collectionName })
}

module.exports = { createCollection, truncate }
