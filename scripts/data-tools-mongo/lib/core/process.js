const { info, blankLine, startSpinnerWith, startProgress } = require('../cli/display')
const { mongoClientFor } = require('../utils/request')
const schema = require('../adapter/schema')
const data = require('../adapter/data')
const gen = require('../generator/schema')

const main = async(userInputs) => {
    const mongoClient = await mongoClientFor(userInputs)

    for (let i = 0; i < userInputs.numberOfCollection; i++) {
        
        const collectionName = `${userInputs.collectionName}_${i}`   
        info(`Creating collection ${i + 1}/${userInputs.numberOfCollection}: ${collectionName}`)
        const collection = mongoClient.collection(collectionName)

        // info('Creating schema on target adapter')
        // await startSpinnerWith('Creating new collection', async() => await schema.createCollection(collectionName, axios), 'Collection was created successfully')
        
        const extraColumns = gen.generateColumns(userInputs.columnCount)
        // await startSpinnerWith('Adding new columns to the collection', async() => await schema.addColumnsToCollection(collectionName, extraColumns, axios), 'The columns were added successfully')

        // if (userInputs.truncate) {
            // await startSpinnerWith('Truncating collection', async() => await schema.truncate(collectionName, axios), 'Collection truncated successfully')
        // }


        info('Loading sample data')

        await startProgress('progress', userInputs.rowCount / userInputs.chunkSize, async() => await data.insertChunk(userInputs.chunkSize, extraColumns, collectionName, collection))

        blankLine()
        blankLine()

    }

}

module.exports = { main }

