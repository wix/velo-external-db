const inquirer = require('inquirer')
const { nonEmpty } = require('../../cli/validators')

const Aws = { accessKeyId: '', secretAccessKey: '' }

const credentials = inquirer.prompt([
    {
        type: 'input',
        name: 'awsAccessKeyId',
        message: 'Access Key Id',
        validate: nonEmpty,
        default: Aws.accessKeyId
    },
    {
        type: 'password',
        name: 'awsSecretAccessKey',
        message: 'Access Key',
        validate: nonEmpty,
        default: Aws.secretAccessKey
    }
])

module.exports = { credentials }