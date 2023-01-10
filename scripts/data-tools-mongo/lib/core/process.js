const { info, blankLine, startProgress } = require('../cli/display')
const { mongoClientFor } = require('../utils/request')
const data = require('../adapter/data')
const gen = require('../generator/schema')

const main = async(userInputs) => {
    const mongoClient = await mongoClientFor(userInputs)

    for (let i = 0; i < userInputs.numberOfCollection; i++) {
        
        const collectionName = `${userInputs.collectionName}_${i}`   
        info(`Creating collection ${i + 1}/${userInputs.numberOfCollection}: ${collectionName}`)
        const collection = mongoClient.collection(collectionName)

        const extraColumns = gen.generateColumns(userInputs.columnCount)
        info('Loading sample data')

        await startProgress('progress', userInputs.rowCount / userInputs.chunkSize, async() => await data.insertChunk(userInputs.chunkSize, extraColumns, collectionName, collection))

        blankLine()
        blankLine()

    }

}

module.exports = { main }

