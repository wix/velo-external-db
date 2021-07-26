const {missingRequiredProps} = require ('./secret_mager_aws')

class SecretMangerClientAzure {
    constructor(){
        this.requiredProps = ['HOST', 'USER_DB', 'PASSWORD','DB', 'SECRET_KEY'];
    }

    async getSecrets() {
        try {
            const missingRequiredPropsList = missingRequiredProps(process.env,this.requiredProps);
            if (missingRequiredPropsList.length){
                console.log(`Missing required props: ${missingRequiredPropsList}`);
                return Promise.reject(`Missing required props: ${missingRequiredPropsList}`);   
            }
            const secrets = {host: process.env.HOST, username:process.env.USER_DB, password:process.env.PASSWORD, DB:process.env.DB, SECRET_KEY: process.env.SECRET_KEY }
            return secrets;
        } catch ( e ) {
            console.log('error getSecrets() azure');
            return Promise.reject(e); 
        }
        
    }
}

module.exports = { SecretMangerClientAzure }
