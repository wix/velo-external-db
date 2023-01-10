const { MongoClient } = require('mongodb')

const mongoClientFor = async({ connectionString }) => {
    const client = new MongoClient(connectionString)
    await client.connect()
    return client.db()
}

module.exports = { 
    mongoClientFor 
}
