const { SecretManagerServiceClient } = require('@google-cloud/secret-manager')
class ConfigWriter {
    constructor({ gcpClientEmail, gcpPrivateKey, gcpProjectId }) {
        this.client = new SecretManagerServiceClient({ credentials: { client_email: gcpClientEmail, private_key: gcpPrivateKey } })
        this.projectId = gcpProjectId
    }

    extractSecretName(secretName) {
        return secretName.split('/').splice(-1)[0]
    }

     async createSecret(secretKey, secretValue) {
        const [secret] = await this.client.createSecret({
            parent: `projects/${this.projectId}`,
            secretId: secretKey,
            secret: { replication: { automatic: {} } }
        })

        await this.client.addSecretVersion({ 
            parent: secret.name, 
            payload: { data: Buffer.from(secretValue, 'utf8') } 
        })

        return this.extractSecretName(secret.name)
     }

    async writeConfig( { secretId, dbCredentials, connectionName, db, secretKey }) {
        const config = {
            USER: dbCredentials.user,
            PASSWORD: dbCredentials.passwd,
            CLOUD_SQL_CONNECTION_NAME: connectionName,
            DB: db,
            SECRET_KEY: secretKey
        }
        const secrets = {}

        for (const [secretKey, secretValue] of Object.entries(config)) {
            const secretName = await this.createSecret(`${secretId}-${secretKey}`, secretValue, this.projectId)
            secrets[secretKey] = secretName
        }

        return secrets
    }
}

module.exports = ConfigWriter
