const {GoogleAuth} = require('google-auth-library')
class DbProvision {
    constructor({ gcpClientEmail, gcpPrivateKey }) {
        this.authClient = new GoogleAuth({
            credentials : { client_email: gcpClientEmail, private_key: gcpPrivateKey },
            scopes: 'https://www.googleapis.com/auth/cloud-platform'
        })
    }

    async createDb( { name, engine, credentials }) {
        const { client, projectId } = await this.credentialsFor()
        const CreateDbInstanceRestUrl = `https://sqladmin.googleapis.com/sql/v1beta4/projects/${projectId}/instances`

        const dbInstanceProperties = {
            databaseVersion: this.asGcp(engine),
            name,
            settings: { tier: 'db-f1-micro' },
            rootPassword: credentials.passwd
        }

        const response = await client.request({ url: CreateDbInstanceRestUrl, method: 'POST', data: dbInstanceProperties})
        return response.operationType === 'CREATE' && response.status === 'PENDING'
    }


    async dbStatusAvailable(name) {
        const { client, projectId } = await this.credentialsFor()
        const StatusRestApiUrl = `https://sqladmin.googleapis.com/sql/v1beta4/projects/${projectId}/instances/${name}`

        const response = await client.request({ url: StatusRestApiUrl })
        const instance = response.data.items.find(i => i.name === name)

        return {
            instanceName: name,
            available: instance.state === 'RUNNABLE',
            host: instance.ipAddresses.find(i => i.type === 'PRIMARY').ipAddress,
            connectionName: instance.connectionName,
            databaseVersion: instance.databaseVersion,
        }
    }

    async postCreateDb(engine, dbName, status) {
        const client = await this.authClient.getClient()
        const projectId = await this.authClient.getProjectId()
        const CreateDbRestUrl = `https://sqladmin.googleapis.com/sql/v1beta4/projects/${projectId}/instances/${status.instanceName}/databases`

        await client.request({ url: CreateDbRestUrl, method:'POST', data: { name:  dbName } })
    }

    asGcp(engine) {
        switch (engine) {
            case 'mysql':
                return 'MYSQL_5_7'
            default:
                break
        }
    }

    async credentialsFor() {
        const client = await this.authClient.getClient()
        const projectId = await this.authClient.getProjectId()
        return { client, projectId }
    }
}


module.exports = DbProvision
