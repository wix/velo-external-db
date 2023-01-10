const { randomEntity } = require('../generator/data')


const insertChunk = async(count, columns, collectionName, mongoCollection) => {
    const items = [...Array(count)]

    for (let i = 0; i < count; i++) {
        items[i] = randomEntity(columns)
    }

    let successes = 0
    let failures = 0


    for (let i = 0; i < count; i++) {
        try {
            await mongoCollection.insertOne(items[i])
            successes = successes + 1
        } catch (err) {

            failures = failures + 1 

        }
    }   

    return { successes, failures }

}

module.exports = { insertChunk }
