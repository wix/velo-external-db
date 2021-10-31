const { askForUserInput } = require('./cli/user-input')
const { info, blankLine, startSpinnerWith, startProgress } = require('./cli/display')
const { axiosFor } = require('./utils/request');
const schema = require('./schema/provision')
const gen = require('./generator/schema')
const process = require('./core/process')

const main = async () => {
    blankLine()
    blankLine()
    blankLine()
    const userInputs = await askForUserInput()
    blankLine()
    blankLine()

    const axios = axiosFor(userInputs)

    info('Creating schema on target adapter')
    await startSpinnerWith('Creating new collection', async () => await schema.createCollection(userInputs.collectionName, axios), 'Collection was created successfully')

    const extraColumns = gen.generateColumns(userInputs.columnCount)
    await startSpinnerWith('Adding new columns to the collection', async () => await schema.addColumnsToCollection(userInputs.collectionName, extraColumns, axios), 'The columns were added successfully')

    if (userInputs.truncate) {
        await startSpinnerWith('Truncating collection', async () => await schema.truncate(userInputs.collectionName, axios), 'Collection truncated successfully')
    }

    blankLine()
    blankLine()
    info('Loading sample data')
    const chunkSize = 100
    await startProgress('progress', userInputs.rowCount / chunkSize, async () => await process.insertChunk(chunkSize, extraColumns, userInputs.collectionName, axios))


}

main()