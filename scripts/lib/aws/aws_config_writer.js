const { SecretsManagerClient, CreateSecretCommand } = require('@aws-sdk/client-secrets-manager')

const SecretId = 'VELO-EXTERNAL-DB-SECRETS'

class ConfigWriter {
    constructor({ awsAccessKeyId, awsSecretAccessKey}) {
        this.client = new SecretsManagerClient({ region: 'us-east-2', credentials: { accessKeyId: awsAccessKeyId, secretAccessKey: awsSecretAccessKey } })
    }

    async writeConfig(dbCredentials, host, db, secretKey) {
        const config = { host: host, username: dbCredentials.user, password: dbCredentials.passwd, DB: db, SECRET_KEY: secretKey }
        await this.client.send(new CreateSecretCommand({ Name: SecretId, SecretString: JSON.stringify(config)} ) )
    }
}

module.exports = ConfigWriter