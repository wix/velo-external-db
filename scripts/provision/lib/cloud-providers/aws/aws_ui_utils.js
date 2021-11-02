const inquirer = require('inquirer')
const { nonEmpty } = require('../../cli/validators')

const Aws = { accessKeyId: '', secretAccessKey: '' }
// const Aws = require('../../../.credentials.json')

const credentials = async () => inquirer.prompt([
    {
        type: 'input',
        name: 'awsAccessKeyId',
        message: 'Access Key Id',
        validate: nonEmpty,
        default: Aws.accessKeyId
    }, {
        type: 'password',
        name: 'awsSecretAccessKey',
        message: 'Access Key',
        validate: nonEmpty,
        default: Aws.secretAccessKey
    }
])

const region = async () => inquirer.prompt([
    {
        type: 'list',
        name: 'region',
        message: 'Region availability',
        default: 'us-east-1',
        choices: [
            {
                name: 'US East (Ohio)',
                value: 'us-east-2'
            }, {
                name: 'US East (N. Virginia)',
                value: 'us-east-1'
            }, {
                name: 'US West (N. California)',
                value: 'us-west-1'
            }, {
                name: 'US West (Oregon)',
                value: 'us-west-2'
            }, {
                name: 'Africa (Cape Town)',
                value: 'af-south-1'
            }, {
                name: 'Asia Pacific (Hong Kong)',
                value: 'ap-east-1'
            }, {
                name: 'Asia Pacific (Mumbai)',
                value: 'ap-south-1'
            }, {
                name: 'Asia Pacific (Osaka)',
                value: 'ap-northeast-3'
            }, {
                name: 'Asia Pacific (Seoul)',
                value: 'ap-northeast-2'
            }, {
                name: 'Asia Pacific (Singapore)',
                value: 'ap-southeast-1'
            }, {
                name: 'Asia Pacific (Sydney)',
                value: 'ap-southeast-2'
            }, {
                name: 'Asia Pacific (Tokyo)',
                value: 'ap-northeast-1'
            }, {
                name: 'Canada (Central)',
                value: 'ca-central-1'
            }, {
                name: 'Europe (Frankfurt)',
                value: 'eu-central-1'
            }, {
                name: 'Europe (Ireland)',
                value: 'eu-west-1'
            }, {
                name: 'Europe (London)',
                value: 'eu-west-2'
            }, {
                name: 'Europe (Milan)',
                value: 'eu-south-1'
            }, {
                name: 'Europe (Paris)',
                value: 'eu-west-3'
            }, {
                name: 'Europe (Stockholm)',
                value: 'eu-north-1'
            }, {
                name: 'Middle East (Bahrain)',
                value: 'me-south-1'
            }, {
                name: 'South America (São Paulo)',
                value: 'sa-east-1'
            }, {
                name: 'AWS GovCloud (US-East)',
                value: 'us-gov-east-1'
            }, {
                name: 'AWS GovCloud (US-West)',
                value: 'us-gov-west-1'
            }
        ],
    },
])

module.exports = { credentials, region }