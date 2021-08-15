const { SecretsManagerClient: AwsSecretMangerClient , GetSecretValueCommand: AwsGetSecretValueCommand  } = require("@aws-sdk/client-secrets-manager");
const translateErrorCodes = require('./external_db_config_exception_translator')

const RequiredSecretsKeys = ['HOST', 'USER', 'PASSWORD','DB', 'SECRET_KEY'];
const AWSRequiredSecretsKeys = ['host', 'username', 'password','DB', 'SECRET_KEY'];
const GCPRequiredSecretsKeys = ['CLOUD_SQL_CONNECTION_NAME', 'USER', 'PASSWORD','DB', 'SECRET_KEY'];

class ExternalDbConfigClient {
    constructor(){
        this.requiredSecrets = RequiredSecretsKeys;
    }

    async readConfig() {
        await this.validateSecrets(this.requiredSecrets,process.env);
        const { HOST: host , USER: user, PASSWORD: password, DB: db, SECRET_KEY: secretKey } = process.env;
        return ({ host, user, password, db, secretKey });
    }

    validateSecrets(requiredSecretsKeys, secrets) {
        const missingRequiredProps = requiredSecretsKeys.reduce((missingRequiredProps, currentRequiredProps)=> {
            if (!secrets.hasOwnProperty(currentRequiredProps) || secrets[currentRequiredProps] === '' )
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
class ExternalDbConfigClientAWS extends ExternalDbConfigClient {

    constructor(secretId , region){
        super()
        this.requiredProps = AWSRequiredSecretsKeys
        this.secretId = 'VELO-EXTERNAL-DB-SECRETS'
        this.secretMangerClient = new AwsSecretMangerClient({ region })
    } 

    async readConfig() {
        try {
            const getSecretsCommand = new AwsGetSecretValueCommand({ SecretId : this.secretId })
            const data = await this.secretMangerClient.send(getSecretsCommand)
            const secrets =  JSON.parse( data.SecretString );
            await this.validateSecrets(this.requiredProps,secrets);
            const {host, username, password, DB : db, SECRET_KEY: secretKey} = secrets;
            return ({ host, user: username, password, db, secretKey });

        } catch ( err ) {
            translateErrorCodes(err);
        }
        
    }
}  

class ExternalDbConfigClientGCP extends ExternalDbConfigClient {
    constructor(){
        super();
        this.requiredProps = GCPRequiredSecretsKeys;
    }

    async readConfig() {
        await this.validateSecrets(this.requiredProps,process.env);
        const { CLOUD_SQL_CONNECTION_NAME: cloudSqlConnectionName, USER: user, PASSWORD: password, DB: db, SECRET_KEY: secretKey} = process.env;
        
        return ({ cloudSqlConnectionName, user, password, db, secretKey });
    }
}

module.exports = { ExternalDbConfigClient,ExternalDbConfigClientAWS, ExternalDbConfigClientGCP }

