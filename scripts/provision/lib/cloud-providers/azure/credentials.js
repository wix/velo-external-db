const inquirer = require('inquirer')
const { nonEmpty } = require('../../cli/validators')

const credentials = async () => inquirer.prompt([
    {
        type: 'input',
        name: 'subscriptionId',
        message: 'Subscription Id',
        validate: nonEmpty
    },
    {
        type: 'input',
        name: 'userObjectId',
        message: 'User Object Id',
        validate: nonEmpty
    }
])

module.exports = { credentials }