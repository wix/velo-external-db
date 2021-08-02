const { SecretsManagerClient: AwsSecretMangerClient , GetSecretValueCommand: AwsGetSecretValueCommand  } = require("@aws-sdk/client-secrets-manager");

const RequiredSecertsKeys = ['HOST', 'USERNAME', 'PASSWORD','DB', 'SECRET_KEY'];
const AWSRequiredSecertsKeys = ['host', 'username', 'password','DB', 'SECRET_KEY'];
const GCPRequiredSecertsKeys = ['CLOUD_SQL_CONNECTION_NAME', 'USERNAME', 'PASSWORD','DB', 'SECRET_KEY'];

class SecretMangerClient {
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
            throw new Error(`Please set the next variable/s in your secret manger: ${missingRequiredProps}`);   
        }

        return Promise.resolve(secrets);
    }
}
class SecretMangerClientAWS extends SecretMangerClient {

    constructor( secretId, region ){
        super();
        this.requiredProps = AWSRequiredSecertsKeys;
        this.secretMagerClient = new AwsSecretMangerClient({ region });
        this.getSecertsCommand = new AwsGetSecretValueCommand({ SecretId : secretId });
        this.retrieveSecrets = this.secretMagerClient.send(this.getSecertsCommand); 
    }

    async getSecrets() {
        try {
            const data = await this.secretMagerClient.send(this.getSecertsCommand);
            const secrets =  JSON.parse( data.SecretString );
            await this.validateSecrets(this.requiredProps,secrets);
            const {host, username, password, DB : db, SECRET_KEY: secretKey} = secrets;
            return ({ host, username, password, db, secretKey });

        } catch ( err ) {
            throw new Error (`Error occurred retrieving secerts: ${err}`);
        }
        
    }
}  

class SecretMangerClientAzure extends SecretMangerClient {
}

class SecretMangerClientGCP extends SecretMangerClient {
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

module.exports = { SecretMangerClient,SecretMangerClientAWS, SecretMangerClientAzure, SecretMangerClientGCP }

