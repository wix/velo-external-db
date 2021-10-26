// const { SecretsManagerClient, CreateSecretCommand } = require('@aws-sdk/client-secrets-manager')
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager')


class ConfigWriter {
    constructor({ gcpClientEmail, gcpPrivateKey, gcpProjectId}) {
        this.client = new SecretManagerServiceClient({ 
            credentials : { client_email: gcpClientEmail, private_key: gcpPrivateKey },
            projectId: gcpProjectId 
        })
    }

    async writeConfig(secretId, dbCredentials, host, db, secretKey) {
        
        const config = { host: host, username: dbCredentials.user, password: dbCredentials.passwd, DB: db, SECRET_KEY: secretKey }
        await this.client
                  .send(new CreateSecretCommand({ Name: secretId, SecretString: JSON.stringify(config)} ) )
    }
}

module.exports = ConfigWriter
