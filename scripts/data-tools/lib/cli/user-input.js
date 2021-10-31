const inquirer = require('inquirer')
const { isNumber, nonEmpty } = require('../utils/utils')

const defaultSettings = {
    collectionName: 'myCollection',
    additionalColumnsCount: 3,
    generatedRows: 10000
}

const askForAdapterDetails = async() => {
    return await inquirer.prompt([
        {
            name: 'adapterUrl',
            message: 'Adapter Url:',
            validate: nonEmpty,
        },
        {
            name: 'secretKey',
            message: 'Secret key',
            validate: nonEmpty,
        }
    ])
}

const askForAdvancedSettings = async() => {
    return await inquirer.prompt([
        {
            name: 'collectionName',
            message: 'Collection Name',
            validate: nonEmpty,
            default: defaultSettings.collectionName
        },
        {
            name: 'additionalColumnsCount',
            message: 'How many columns to generate',
            validate: isNumber,
            default: defaultSettings.additionalColumnsCount
        },
        {
            name: 'generatedRowCount',
            message: 'How many rows to generate',
            validate: isNumber,
            default: defaultSettings.generatedRows
        }
    ])
}

const askForUserInput = async() => {
    const { adapterUrl, secretKey } = await askForAdapterDetails()
    const { collectionName, additionalColumnsCount, generatedRowCount } = await askForAdvancedSettings()

    return {
        adapterUrl, secretKey,
        collectionName, additionalColumnsCount, generatedRowCount
    }
}


module.exports = { askForUserInput }
