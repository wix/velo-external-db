const { randomEntity } = require('../generator/data')
import { MongoClient } from 'mongodb'

const client = new MongoClient('mongodb://master:master123@docdb-ue1-1.cluster-cnktnldnpl5g.us-east-1.docdb.amazonaws.com:27017/?replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

await client.connect();  

const insert = async(items, collectionName, axios) => {
    await axios.post('/data/insert/bulk', { collectionName, items })
               .catch(error => console.log(`Error adding chunk: ${error.message}`))
}

const insertToMongo = async(items, collectionName) => {
    await client.db()
        .collection(collectionName)
        //@ts-ignore - Type 'string' is not assignable to type 'ObjectId', objectId Can be a 24 character hex string, 12 byte binary Buffer, or a number. and we cant assume that on the _id input
        .insertMany(items)
}

const insertChunk = async(count, columns, collectionName, axios) => {
    const items = [...Array(count)].map(() => randomEntity(columns))
    // await insert(items, collectionName, axios)
    await insert(items, collectionName, axios)
}

module.exports = { insertChunk }
