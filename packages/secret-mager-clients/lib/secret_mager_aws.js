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
        const missingRequiredPropsList = missingRequiredProps({...process.env},this.requiredProps);
    
        if (missingRequiredPropsList.length){
            return Promise.reject(`Missing required props: ${missingRequiredPropsList}`);   
        }

        const { HOST, USERNAME, PASSWORD, DB, SECRET_KEY } = process.env;
        
        return ({ HOST ,USERNAME, PASSWORD, DB, SECRET_KEY});
    }
}

class SecretMangerClientAWS {
    constructor( secretId = 'DB_INFO' , region = 'us-east-1' ){
        this.SMClient = new SecretsManagerClient({ region });
        this.getValueCommand = new GetSecretValueCommand({ secretId });
        this.requiredProps = ['host', 'username', 'password','DB', 'SECRET_KEY'];
    }

    async getSecrets() {
        try {
            const response = await this.SMClient.send(this.getValueCommand);
            const secrets =  JSON.parse(response.SecretString);
            const missingRequiredPropsList = missingRequiredProps(secrets,this.requiredProps);

            if (missingRequiredPropsList.length){
                return Promise.reject(`Missing required props: ${missingRequiredPropsList}`);   
            }
                
            return secrets;
        } catch ( e ) {
            return Promise.reject(e); 
        }
        
    }
}

module.exports = { SecretMangerClientENV,SecretMangerClientAWS }

