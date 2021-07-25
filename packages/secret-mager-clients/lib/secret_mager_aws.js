const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");


class SecretMangerClientAWS {
    constructor( secretId = 'DB_INFO' , region = 'us-east-1' ){
        this.SMClient = new SecretsManagerClient({ region });
        this.getValueCommand = new GetSecretValueCommand({ secretId });
    }

    async getSecrets() {
        try {
            const response = await this.SMClient.send(this.getValueCommand);
            return JSON.parse(response.SecretString);
        } catch (e) {
            console.error(e);
            return Promise.reject(e); 
        }
        
    }


}

module.exports = { SecretMangerClientAWS }

