const { SecretsManagerClient: AwsSecretMangerClient , GetSecretValueCommand: AwsGetSecretValueCommand  } = require("@aws-sdk/client-secrets-manager");
const translateErrorCodes = require('./external_db_config_exception_translator')

const RequiredSecertsKeys = ['HOST', 'USERNAME', 'PASSWORD','DB', 'SECRET_KEY'];
const AWSRequiredSecertsKeys = ['host', 'username', 'password','DB', 'SECRET_KEY'];
const GCPRequiredSecertsKeys = ['CLOUD_SQL_CONNECTION_NAME', 'USERNAME', 'PASSWORD','DB', 'SECRET_KEY'];

class ExternalDbConfigClient {
    constructor(){
        this.requiredSecrets = RequiredSecertsKeys;
    }

    async getSecrets() {
        await this.validateSecrets(this.requiredSecrets,process.env);
        const { HOST: host , USERNAME: username, PASSWORD: password, DB: db, SECRET_KEY: secretKey } = process.env;
        return ({ host, username, password, db, secretKey });
    }

    validateSecrets(requiredSecertsKeys,secrets) {
        const missingRequiredProps = requiredSecertsKeys.reduce((missingRequiredProps, currentRequiredProps)=> {
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

    constructor(secretId , region){;
        super();
        this.requiredProps = AWSRequiredSecertsKeys;
        this.secretMagerClient = new AwsSecretMangerClient({ region });
        this.getSecertsCommand = new AwsGetSecretValueCommand({ SecretId : secretId });
    } 

    async getSecrets() {
        try {
            const data = await this.secretMagerClient.send(this.getSecertsCommand);
            const secrets =  JSON.parse( data.SecretString );
            await this.validateSecrets(this.requiredProps,secrets);
            const {host, username, password, DB : db, SECRET_KEY: secretKey} = secrets;
            return ({ host, username, password, db, secretKey });

        } catch ( err ) {
            translateErrorCodes(err);
        }
        
    }
}  

class ExternalDbConfigClientAzure extends ExternalDbConfigClient {
}

class ExternalDbConfigClientGCP extends ExternalDbConfigClient {
    constructor(){
        super();
        this.requiredProps = GCPRequiredSecertsKeys;
    }

    async getSecrets() {
        await this.validateSecrets(this.requiredProps,process.env);
        const { CLOUD_SQL_CONNECTION_NAME: cloudSqlConnectionName, USERNAME: username, PASSWORD: password, DB: db, SECRET_KEY: secretKey} = process.env;
        
        return ({ cloudSqlConnectionName, username, password, db, secretKey });
    }
}

module.exports = { ExternalDbConfigClient,ExternalDbConfigClientAWS, ExternalDbConfigClientAzure, ExternalDbConfigClientGCP }

