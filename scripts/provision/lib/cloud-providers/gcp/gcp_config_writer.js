const { SecretManagerServiceClient } = require('@google-cloud/secret-manager')
const { randomWithPrefix } = require('../../utils/utils')


class ConfigWriter {
    constructor({ gcpClientEmail, gcpPrivateKey }) {
        this.client = new SecretManagerServiceClient({ credentials : { client_email: gcpClientEmail, private_key: gcpPrivateKey }})
    }

    extractSecretName(secretName) {
        return secretName.split('/').splice(-1)[0]
    }

     async createSecret(secretKey, secretValue, projectId) {
        const [secret] = await this.client.createSecret({
            parent: `projects/${projectId}`,
            secretId: randomWithPrefix(`VELO-EXTERNAL-DB-${secretKey}`),
            secret: { replication: { automatic: {} } }
        })

        await this.client.addSecretVersion({ 
            parent: secret.name, 
            payload: { data: Buffer.from(secretValue, 'utf8') } 
        })

        return this.extractSecretName(secret.name)
     }

    async writeConfig( { dbCredentials, connectionName, db, secretKey }) {
        const config = { USER: 'root', PASSWORD: dbCredentials.passwd, CLOUD_SQL_CONNECTION_NAME: connectionName, DB: db, SECRET_KEY: secretKey }
        const projectId = await this.client.getProjectId()
        const secrets = {}

        for (const [secretKey, secretValue] of Object.entries(config)) {
            const secretName = await this.createSecret(secretKey, secretValue, projectId)
            secrets[secretKey] = secretName
        }

        return secrets
    }
}

module.exports = ConfigWriter
