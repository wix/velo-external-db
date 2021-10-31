const { askForUserInput } = require('./cli/user-input')
const { axiosFor } = require('./utils/request');
const { createCollection, addColumnsToCollection } = require('./schema/provision')
const { generateColumns } = require('./generator/schema')
const { insertItems } = require('./core/process')

const main = async(userInputs) => {
    const axios = axiosFor(userInputs)
    await createCollection(userInputs.collectionName, axios)
    const generatedColumns = generateColumns(userInputs.additionalColumnsCount)
    await addColumnsToCollection(userInputs.collectionName, generatedColumns, axios)
    await insertItems(userInputs.generatedRowCount, generatedColumns, userInputs.collectionName, axios)
}

const process = async() => {
    const userInputs = await askForUserInput()
    await main(userInputs)
}

process()