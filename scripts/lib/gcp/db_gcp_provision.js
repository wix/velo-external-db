const {GoogleAuth} = require('google-auth-library')
const publicIp = require('public-ip')
const factory = require('../aws/db/factory')
const { dateTo3339Format, xHoursFromNow } = require('../utils/utils')

class DbProvision {
    constructor({ gcpClientEmail, gcpPrivateKey }) {
        this.authClient = new GoogleAuth({
            credentials : { client_email: gcpClientEmail, private_key: gcpPrivateKey },
            scopes: 'https://www.googleapis.com/auth/cloud-platform'
        })
        this.instancesApiURL = ( projectId ) => `https://sqladmin.googleapis.com/sql/v1beta4/projects/${projectId}/instances`
    }

    asGcp(engine) {
        switch (engine) {
            case 'mysql':
                return 'MYSQL_5_7'
            default:
                break
        }
    }

    async createDb( { name, engine, credentials }) {

        const client = await this.authClient.getClient()
        const projectId = await this.authClient.getProjectId()
        const ip = await publicIp.v4()

        const dbInstanceProperties = {
            databaseVersion: this.asGcp(engine),
            name,
            settings: { 
                tier: 'db-f1-micro',
                ipConfiguration: {
                    authorizedNetworks: [
                        { name: 'velo-script', value: ip, expirationTime: dateTo3339Format(xHoursFromNow(1)) }
                    ]
                }
            },
            rootPassword: credentials.passwd
        }

        const response = await client.request({ url: this.instancesApiURL( projectId ), method: 'POST', data: dbInstanceProperties})

        return response.operationType === 'CREATE'
    }

    async dbStatusAvailable(name) {
        const client = await this.authClient.getClient()
        const projectId = await this.authClient.getProjectId()

        const response = await client.request({ url: this.instancesApiURL( projectId ) })
        const { state, ipAddresses, connectionName, databaseVersion } = response.data.items.find(i => i.name === name)

        return { 
            available: state === 'RUNNABLE',
            ipAddresses: ipAddresses.find(i=> i.type === 'PRIMARY').ipAddress,
            connectionName, databaseVersion 
        }
    }

    async postCreateDb(engine, dbName, status, credentials) {
        await factory.clientFor(engine)
                     .createDatabase(dbName, status.host, credentials)
    }
}


module.exports = DbProvision