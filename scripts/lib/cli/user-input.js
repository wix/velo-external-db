const inquirer = require('inquirer')

const dbSupportedOn = (vendor) => {
    const aws = [ 'mysql', 'postgres', 'mongo']
    const gcp = [ 'mysql', 'postgres', 'mongo', 'spanner', 'firestore']
    const azure = [ 'mysql', 'postgres', 'mongo', 'mssql' ]

    switch (vendor) {
        case 'aws':
            return q => aws.includes(q.value)
        case 'gcp':
            return q => gcp.includes(q.value)
        case 'azure':
            return q => azure.includes(q.value)
    }
}

const nonEmpty = input => !(!input || input.trim() === '')

// const Aws = require('../../.credentials.json')
// const Azr = require ('../../credentials.json')
const credentialsFor = vendor => {
    switch (vendor) {
        case 'aws':
            return inquirer.prompt([
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
        case 'gcp':
            return inquirer.prompt([
                {
                    type: 'input',
                    name: 'whatever',
                    message: 'gcp credentials todo',
                },
            ])
        case 'azure':
            return inquirer.prompt([
                {
                    type: 'input',
                    name: 'subscriptionId',
                    message: 'Subscription Id',
                    validate: nonEmpty,
                    default: Azr.SUBSCRIPTION_ID
                },
                {
                    type: 'input',
                    name: 'userObjectId',
                    message: 'User Object Id',
                    validate: nonEmpty,
                    default: Azr.ID
                }
            ])
    }
}

const askForUserInput = async () => {
    return await inquirer.prompt([
        {
            type: 'list',
            name: 'vendor',
            message: 'Select Cloud Provider',
            choices: [
                {
                    name: 'Amazon Web Services (AWS)',
                    value: 'aws'
                },
                {
                    name: 'Google Cloud: Cloud Computing Services (GCP)',
                    value: 'gcp'
                },
                {
                    name: 'Microsoft Azure',
                    value: 'azure'
                }
            ],
        },
        {
            type: 'list',
            name: 'engine',
            message: 'Select DB Type',
            choices: ( { vendor }) => [
                {
                    name: 'MySql',
                    value: 'mysql'
                },
                {
                    name: 'Postgres',
                    value: 'postgres'
                },
                {
                    name: 'Mongo',
                    value: 'mongo'
                },
                {
                    name: 'Spanner',
                    value: 'spanner'
                },
                {
                    name: 'Firestore',
                    value: 'firestore'
                },
                {
                    name: 'Sql Server',
                    value: 'mssql'
                }
            ].filter( dbSupportedOn(vendor) ),
        },
        // {
        //     type: 'confirm',
        //     name: 'simple',
        //     message: 'Use default settings?',
        //     default: 'Y',
        // }
    ]).then(async answers => {
        const credentials = await credentialsFor( answers.vendor )

        return { ...answers, credentials: credentials }
    })
}

module.exports = { askForUserInput }
