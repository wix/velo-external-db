const inquirer = require('inquirer')

inquirer.prompt([
    {
        type: 'list',
        name: 'provider',
        message: 'Select Cloud Provider',
        choices: [
            {
                name: 'Amazon Web Services (AWS)',
                value: 'aws'
            },
            {
                name: 'Microsoft Azure',
                value: 'azure'
            }
        ],
    },
    {
        type: 'list',
        name: 'db',
        message: 'Select DB Type',
        choices: [
            {
                name: 'MySql',
                value: 'mysql'
            },
            {
                name: 'Postgres',
                value: 'postgres'
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
        ],
    }
]).then(answers => {
    console.log(answers)
})

