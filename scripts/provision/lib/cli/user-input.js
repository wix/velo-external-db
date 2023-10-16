const inquirer = require('inquirer')
const { providerFor } = require('../cloud-providers/factory')

const dbSupportedOn = (vendor) => {
    const aws = [ 'mysql', 'postgres', 'mssql']
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


const askForUserInput = async() => {
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
        const credentials = await providerFor(answers.vendor).credentials()
        const { region } = await providerFor(answers.vendor).region(credentials)

        return { ...answers, credentials, region }
    })
}

module.exports = { askForUserInput }
