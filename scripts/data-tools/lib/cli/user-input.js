const inquirer = require('inquirer')
const { isNumber, nonEmpty } = require('../utils/utils')

const defaultSettings = {
    collectionName: 'myCollection',
    additionalColumnsCount: 3,
    generatedRows: 10000
}

const askForAdaptorDetails = async() => {
    return await inquirer.prompt([
        {
            name: 'adaptorUrl',
            message: 'Adaptor service\'s URL',
            validate: nonEmpty,
        },
        {
            name: 'adaptorSecretKey',
            message: 'Adaptor\'s secret key',
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
    const { adaptorUrl, adaptorSecretKey } = await askForAdaptorDetails()
    const { collectionName, additionalColumnsCount, generatedRowCount } = await askForAdvancedSettings()

    return {
        adaptorUrl, adaptorSecretKey,
        collectionName, additionalColumnsCount, generatedRowCount
    }
}


module.exports = { askForUserInput }
