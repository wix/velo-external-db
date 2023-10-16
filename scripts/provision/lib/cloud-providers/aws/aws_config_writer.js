const { SecretsManagerClient, CreateSecretCommand } = require('@aws-sdk/client-secrets-manager')

class ConfigWriter {
    constructor({ awsAccessKeyId, awsSecretAccessKey }, region) {
        this.client = new SecretsManagerClient({ region, credentials: { accessKeyId: awsAccessKeyId, secretAccessKey: awsSecretAccessKey } })
    }

    async writeConfig({ secretId, dbCredentials, host, db, secretKey }) {
        const config = { host, username: dbCredentials.user, password: dbCredentials.passwd, DB: db, SECRET_KEY: secretKey }
        await this.client.send(new CreateSecretCommand({ Name: secretId, SecretString: JSON.stringify(config) } ) )
    }
}

module.exports = ConfigWriter
