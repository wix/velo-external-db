const inquirer = require('inquirer')
const { isNumber, nonEmpty } = require('../utils/utils')

const defaultSettings = {
    numberOfCollection: 1,
    collectionName: 'my_collection',
    columnCount: 3,
    rowCount: 10000
}

const askForMongoDetails = async() => {
    return await inquirer.prompt([
        {
            name: 'connectionString',
            message: 'Connection String:',
            validate: nonEmpty,
        }
    ])
}

const askForAdvancedSettings = async() => { 
    return await inquirer.prompt([
        {
            name: 'numberOfCollection',
            message: 'Number of collections:',
            validate: nonEmpty,
            default: defaultSettings.numberOfCollection
        },
        {
            name: 'collectionName',
            message: 'Collection Name',
            validate: nonEmpty,
            default: defaultSettings.collectionName
        },
        {
            name: 'columnCount',
            message: 'How many columns to generate ? ',
            validate: isNumber,
            default: defaultSettings.columnCount
        },
        {
            name: 'rowCount',
            message: 'Number of Rows: ',
            validate: isNumber,
            default: defaultSettings.rowCount
        },
        {
            name: 'truncate',
            type: 'confirm',
            message: 'Truncate table before insert? ',
            default: false
        },
        {
            name: 'chunkSize',
            message: 'Chunk Size:',
            default: 100
        }
    ])
}

const askForUserInput = async() => {
    const mongoDetails = await askForMongoDetails()
    const moreInput = await askForAdvancedSettings()

    return { ...mongoDetails, ...moreInput }
}


module.exports = { askForUserInput }
