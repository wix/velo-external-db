const { info, blankLine, startSpinnerWith, startProgress } = require('../cli/display')
const { mongoClientFor } = require('../utils/request')
const data = require('../adapter/data')
const schema = require('../adapter/schema')
const gen = require('../generator/schema')

const main = async(userInputs) => {
    const mongoClient = await mongoClientFor(userInputs)

    for (let i = 0; i < userInputs.numberOfCollection; i++) {
        
        const collectionName = `${userInputs.collectionName}_${i}`   
        info(`Collection ${i + 1}/${userInputs.numberOfCollection}: ${collectionName}`)
        const collection = mongoClient.collection(collectionName)

        const extraColumns = gen.generateColumns(userInputs.columnCount)

        if (userInputs.truncate) {
            await startSpinnerWith('Truncating collections if exists', async() => await schema.truncate(collectionName, mongoClient), 'Collection truncated successfully')
        }

        await startSpinnerWith('Creating new collection',  async() => await schema.createCollection(collectionName, extraColumns, mongoClient), 'Collection was created successfully')
    
        await startProgress('progress', userInputs.rowCount / userInputs.chunkSize, async() => await data.insertChunk(userInputs.chunkSize, extraColumns, collectionName, collection))

        blankLine()
        blankLine()

    }

    process.exit(0)

}
module.exports = { main }

