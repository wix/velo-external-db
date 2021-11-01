const inquirer = require('inquirer')
const { nonEmpty } = require('../../cli/validators')

const GCP = { gcpClientEmail: '', gcpPrivateKey: '', gcpProjectId: '' }

const credentials = inquirer.prompt([
    {
        type: 'input',
        name: 'gcpClientEmail',
        message: 'GCP Client email',
        validate: nonEmpty,
        default: GCP.gcpClientEmail
    },
    {
        type: 'input',
        name: 'gcpPrivateKey',
        message: 'GCP Private Key',
        validate: nonEmpty,
        default: GCP.gcpPrivateKey
    },
    {
        type: 'input',
        name: 'gcpProjectId',
        message: 'GCP project id',
        validate: nonEmpty,
        default: GCP.gcpProjectId
    }
])

module.exports = { credentials }