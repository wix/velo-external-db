const { SecretsManagerClient: AwsSecretMangerClient , GetSecretValueCommand: AwsGetSecretValueCommand  } = require("@aws-sdk/client-secrets-manager");


const AWSRequiredSecretsKeys = ['host', 'username', 'password','DB', 'SECRET_KEY'];


class AwsSecretsProvider {
    constructor(region) {
        this.secretId = 'VELO-EXTERNAL-DB-SECRETS'
        this.secretMangerClient = new AwsSecretMangerClient({ region })
    }

    async getSecrets () {
        const getSecretsCommand = new AwsGetSecretValueCommand({ SecretId : this.secretId })
        const data = await this.secretMangerClient.send(getSecretsCommand)
        const secrets =  JSON.parse( data.SecretString );
        const {host, username : user, password, DB : db, SECRET_KEY: secretKey} = secrets;
        return {host, user, password,db, secretKey};
    }

    validateSecrets(requiredSecretsKeys, secrets) {
        const missingRequiredProps = requiredSecretsKeys.reduce((missingRequiredProps, currentRequiredProps)=> {
            if (!secrets.hasOwnProperty(currentRequiredProps) || secrets[currentRequiredProps] == undefined  )
                return [...missingRequiredProps,currentRequiredProps];
            else 
                return missingRequiredProps;
        },[]);

        if (missingRequiredProps.length){            
            translateErrorCodes('MISSING_VARIABLE',missingRequiredProps);
        }

        return Promise.resolve(secrets);
    }

}




module.exports = { AwsSecretsProvider }