const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

const missingRequiredProps = (obj,requiredProps) => {
    return requiredProps.reduce((missingRequiredProps, currentRequiredProps)=>{
        if (!obj.hasOwnProperty(currentRequiredProps))
            return [...missingRequiredProps,currentRequiredProps];
        else 
            return missingRequiredProps;
    },[]);
}

class SecretMangerClientENV {
    constructor(){
        this.requiredProps = ['HOST', 'USERNAME', 'PASSWORD','DB', 'SECRET_KEY'];
    }

    async getSecrets() {
        const missingRequiredPropsList = missingRequiredProps(process.env,this.requiredProps);
    
        if (missingRequiredPropsList.length){
            throw new Error(`Please set the next variable/s in your secret manger: ${missingRequiredPropsList}`);   
        }

        const { HOST, USERNAME, PASSWORD, DB, SECRET_KEY } = process.env;
        
        return ({ host: HOST ,username: USERNAME, password: PASSWORD, db : DB, secretKey : SECRET_KEY});
    }
}

class SecretMangerClientAWS {

    constructor( SecretId = 'DB_INFO' , region =  process.env.AWS_REGION ){
        this.requiredProps = ['host', 'username', 'password','DB', 'SECRET_KEY'];
        this.SMClient = new SecretsManagerClient({ region });
        this.getValueCommand = new GetSecretValueCommand({ SecretId });
    }

    async getSecrets() {
        try {
            const response = await this.SMClient.send(this.getValueCommand);
            const secrets =  JSON.parse(response.SecretString);
            const missingRequiredPropsList = missingRequiredProps(secrets,this.requiredProps);

            if (missingRequiredPropsList.length){
                throw new Error (`Please set the next variable/s in your secret manger: ${missingRequiredPropsList} `);
            } 
            return ({ host : secrets.host , username: secrets.username, password : secrets.password, db : secrets.DB, secretKey : secrets.SECRET_KEY});
        } catch ( err ) {
            throw new Error (`Error occurred retrieving secerts: ${err}`);
        }
        
    }
}  

class SecretMangerClientAzure extends SecretMangerClientENV {
}

class SecretMangerClientGCP extends SecretMangerClientENV {
    constructor(){
        super();
        this.requiredProps = ['CLOUD_SQL_CONNECTION_NAME', 'USERNAME', 'PASSWORD','DB', 'SECRET_KEY'];
    }

    async getSecrets() {
        const missingRequiredPropsList = missingRequiredProps(process.env,this.requiredProps);
    
        if (missingRequiredPropsList.length){
            throw new Error(`Please set the next variable/s in your secret manger: ${missingRequiredPropsList}`);   
        }

        const { CLOUD_SQL_CONNECTION_NAME, USERNAME, PASSWORD, DB, SECRET_KEY } = process.env;
        
        return ({ cloudSqlConnectionName: CLOUD_SQL_CONNECTION_NAME ,username: USERNAME, password: PASSWORD, db : DB, secretKey : SECRET_KEY});
    }
}

module.exports = { SecretMangerClientENV,SecretMangerClientAWS, SecretMangerClientAzure, SecretMangerClientGCP }

