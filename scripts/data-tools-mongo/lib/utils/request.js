const { MongoClient } = require('mongodb')

const mongoClientFor = async({ connectionString, dbName }) => {
    const client = new MongoClient(connectionString)
    await client.connect()
    return client.db(dbName)
}

module.exports = { 
    mongoClientFor 
}
