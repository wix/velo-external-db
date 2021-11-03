const inquirer = require('inquirer')
const { nonEmpty } = require('../../cli/validators')
const {GoogleAuth} = require('google-auth-library')


const GCP = { gcpClientEmail: '', gcpPrivateKey: '', gcpProjectId: '' }

const credentials = async () => inquirer.prompt([
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

const region = async(credentials) => inquirer.prompt([
    {
        type: 'list',
        name: 'region',
        message: 'Region availability',
        choices: async() => await regionList(credentials)
    }
])


const regionList =async({ gcpClientEmail, gcpPrivateKey, gcpProjectId }) => {
    const authClient = new GoogleAuth({
        credentials : { client_email: gcpClientEmail, private_key: gcpPrivateKey },
        scopes: 'https://www.googleapis.com/auth/cloud-platform'
    })
    const RegionApiUrl = `https://compute.googleapis.com/compute/v1/projects/${gcpProjectId}/regions`

    const client = await authClient.getClient()
    const res = await client.request({ url: RegionApiUrl })

    return res.data.items.map(i => i.name)
}



module.exports = { credentials, region }