const { GoogleAuth } = require('google-auth-library')
class DbProvision {
    constructor({ gcpClientEmail, gcpPrivateKey, gcpProjectId }) {
        this.authClient = new GoogleAuth({
            credentials: { client_email: gcpClientEmail, private_key: gcpPrivateKey },
            scopes: 'https://www.googleapis.com/auth/cloud-platform'
        })
        this.projectId = gcpProjectId
    }

    async preCreateDb() {

    }

    async createDb( { name, engine, credentials }) {
        const client = await this.credentialsFor()
        const CreateDbInstanceRestUrl = `https://sqladmin.googleapis.com/sql/v1beta4/projects/${this.projectId}/instances`

        const dbInstanceProperties = {
            databaseVersion: this.databaseVersionFor(engine),
            name,
            settings: { tier: 'db-f1-micro' },
            rootPassword: credentials.passwd
        }

        const response = await client.request({ url: CreateDbInstanceRestUrl, method: 'POST', data: dbInstanceProperties })
        return response.operationType === 'CREATE' && response.status === 'PENDING'
    }


    async dbStatusAvailable(name) {
        const client = await this.credentialsFor()
        const StatusRestApiUrl = `https://sqladmin.googleapis.com/sql/v1beta4/projects/${this.projectId}/instances/${name}`

        const response = await client.request({ url: StatusRestApiUrl })
        const instance = response.data

        return {
            instanceName: name,
            available: instance.state === 'RUNNABLE',
            host: instance.ipAddresses.find(i => i.type === 'PRIMARY').ipAddress,
            connectionName: instance.connectionName,
            databaseVersion: instance.databaseVersion,
        }
    }

    async postCreateDb(engine, dbName, status, dbCredentials) {
        await this.createNewDbUser(status.instanceName, dbCredentials.user, dbCredentials.passwd)
        await this.createDatabase(status.instanceName, dbName)
    }

    databaseVersionFor(engine) {
        switch (engine) {
            case 'mysql':
                return 'MYSQL_5_7'
            case 'postgres':
                return 'POSTGRES_13'
            default:
                break
        }
    }

    async credentialsFor() {
        
        return await this.authClient.getClient()
    }

    async createNewDbUser(instanceName, userName, password) {
        const client = await this.credentialsFor()
        const CreateNewUserRestUrl = `https://sqladmin.googleapis.com/sql/v1beta4/projects/${this.projectId}/instances/${instanceName}/users`

        await client.request({ url: CreateNewUserRestUrl, method: 'POST', data: { name: userName, password } })
    }

    async createDatabase(instanceName, dbName) {
        const client = await this.credentialsFor()
        const CreateDbRestUrl = `https://sqladmin.googleapis.com/sql/v1beta4/projects/${this.projectId}/instances/${instanceName}/databases`
        
        await client.request({ url: CreateDbRestUrl, method: 'POST', data: { name: dbName } })
    }
}


module.exports = DbProvision
