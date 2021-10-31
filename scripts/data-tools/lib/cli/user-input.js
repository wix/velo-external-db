const inquirer = require('inquirer')
const { isNumber, nonEmpty } = require('../utils/utils')

const defaultSettings = {
    collectionName: 'my_collection',
    columnCount: 3,
    rowCount: 10000
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
            message: 'Secret key: ',
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
        }
    ])
}

const askForUserInput = async() => {
    const adapter = await askForAdapterDetails()
    const moreInput = await askForAdvancedSettings()

    return { ...adapter, ...moreInput }
}


module.exports = { askForUserInput }
