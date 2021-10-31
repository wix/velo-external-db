const { askForUserInput } = require('./cli/user-input')
const { axiosFor } = require('./utils/request');
const schema = require('./schema/provision')
const gen = require('./generator/schema')
const process = require('./core/process')

const main = async (userInputs) => {
    const axios = axiosFor(userInputs)
    await schema.createCollection(userInputs.collectionName, axios)
    const generatedColumns = gen.generateColumns(userInputs.columnCount)
    await schema.addColumnsToCollection(userInputs.collectionName, generatedColumns, axios)
    await process.insertItems(userInputs.rowCount, generatedColumns, userInputs.collectionName, axios)
}

const process = async () => {
    const userInputs = await askForUserInput()
    await main(userInputs)
}

process()