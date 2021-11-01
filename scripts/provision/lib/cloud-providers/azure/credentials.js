const inquirer = require('inquirer')
const { nonEmpty } = require('../../cli/validators')
const { SubscriptionClient } = require('@azure/arm-subscriptions')
const { DefaultAzureCredential } = require('@azure/identity')

const credentials = async() => inquirer.prompt([
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

const region = async(credentials) => inquirer.prompt([
    {
        type: 'list',
        name: 'region',
        message: 'Region availability',
        choices: async() => await regionList(credentials.subscriptionId)
    }
])


const regionList =async(subscriptionId) => {
    const client = new SubscriptionClient(new DefaultAzureCredential())
    const regions =  await client.subscriptions.listLocations(subscriptionId)
    return regions.map(region => ({ name: region.displayName, value: region.value }))
}

module.exports = { credentials, region }
