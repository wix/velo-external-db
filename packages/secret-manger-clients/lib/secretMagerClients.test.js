const Chance = require('chance');

const chance = Chance();

const randomSecret = () => {
    
    const secretCapitalized = {
        HOST: chance.url(),
        USERNAME: chance.first(),
        PASSWORD: chance.guid(),
        SECRET_KEY: chance.guid(),
        DB: chance.word(),
    };
    const secretUncapitalized = {
        host: secretCapitalized.HOST,
        username: secretCapitalized.USERNAME,
        password: secretCapitalized.PASSWORD,
        secretKey: secretCapitalized.SECRET_KEY,
        db: secretCapitalized.DB
    };
    const secertsLikeAWS = {
        host: secretCapitalized.HOST,
        username: secretCapitalized.USERNAME,
        password: secretCapitalized.PASSWORD,
        SECRET_KEY: secretCapitalized.SECRET_KEY,
        DB: secretCapitalized.DB
    };
    const secertsLikeGCPCapitalized = {
        CLOUD_SQL_CONNECTION_NAME: secretCapitalized.HOST,
        USERNAME: secretCapitalized.USERNAME,
        PASSWORD: secretCapitalized.PASSWORD,
        SECRET_KEY: secretCapitalized.SECRET_KEY,
        DB: secretCapitalized.DB
    };

    const secertsLikeGCPUncapitalized  = {
        cloudSqlConnectionName: secertsLikeGCPCapitalized.CLOUD_SQL_CONNECTION_NAME,
        username: secertsLikeGCPCapitalized.USERNAME,
        password: secertsLikeGCPCapitalized.PASSWORD,
        secretKey: secertsLikeGCPCapitalized.SECRET_KEY,
        db: secertsLikeGCPCapitalized.DB
    };


    return { secretCapitalized, secretUncapitalized, secertsLikeAWS, secertsLikeGCPCapitalized, secertsLikeGCPUncapitalized }
};

/* AWS secret manger */
const awsSdkSecretMangerSendStub = ( secretMangerClientAws ) => {
    const sinon = require("sinon");
    return sinon.stub(secretMangerClientAws.secretMagerClient, "send");
}

const loadSecretToAwsMockSecretManger = ( sendStub, secret ) => {
    sendStub.returns(Promise.resolve({SecretString : JSON.stringify(secret)}));
};

const deleteRandomKeyFromAwsMockSecretManger = ( sendStub, secrets ) => {
    const {deletedKey, secretsAfterDeletion } = deleteRandomSecret(secrets);
    loadSecretToAwsMockSecretManger(sendStub,secrets);
    return deletedKey;
};

const clearRandomKeyFromAwsMockSecretManger = ( sendStub, secrets ) => {
    keyToClear = randomKey(secrets);
    secrets[keyToClear] = '';
    loadSecretToAwsMockSecretManger(sendStub,secrets);
    return keyToClear;
};

/*Secret Manger*/
const clearSecertsFromEnv = () => {
    delete process.env.HOST;
    delete process.env.USERNAME;
    delete process.env.PASSWORD;
    delete process.env.CLOUD_SQL_CONNECTION_NAME;
    delete process.env.DB;
    delete process.env.SECRET_KEY;
}

const loadSecretsToEnv = ( secrets ) => {
    clearSecertsFromEnv();
    process.env = Object.assign(process.env,secrets); 
};

const randomKey = ( secrets ) => {
    secretKeys = Object.keys(secrets);
    selectedKey = secretKeys [Math.floor(Math.random() * secretKeys.length)];
    return selectedKey;
}

const deleteRandomSecret = ( secrets ) => {
    deletedKey = randomKey(secrets);
    delete secrets[deletedKey];
    return { deletedKey, secretsAfterDeletion: secrets };

};

const deleteRandomSecretFromEnv = ( secrets ) => {
    const { deletedKey, secretsAfterDeletion } = deleteRandomSecret( secrets );
    delete process.env[deletedKey];
    return {deletedKey, secretsAfterDeletion};
};

const clearRandomSecretFromEnv = ( secrets ) => {
    keyToClear = randomKey(secrets);
    process.env[keyToClear] = '';
    return keyToClear;
}

describe('Secrect Manger Clients', () => {
    
    describe('Secrect Manger Client', () => {
        
        beforeEach(() => {        
            const {secretCapitalized,secretUncapitalized} = randomSecret();
            ctx.secretCapitalized = secretCapitalized;
            ctx.secretUncapitalized = secretUncapitalized;   
            loadSecretsToEnv(ctx.secretCapitalized);
        });

        test('get secret with secret client', async () => {
            const result = await env.secretMangerClient.getSecrets();
            expect(result).toStrictEqual(ctx.secretUncapitalized);
        });

        test('get secerts without all the required fields', async () => {
            const { deletedKey } = deleteRandomSecretFromEnv(ctx.secretCapitalized);
            await expect(env.secretMangerClient.getSecrets()).rejects.toThrow(`Please set the next variable/s in your secret manger: ${deletedKey}`);
        });

        test('get secerts with a field that is empty', async () => {
            const keyToClear = clearRandomSecretFromEnv(ctx.secretCapitalized);
            await expect(env.secretMangerClient.getSecrets()).rejects.toThrow(`Please set the next variable/s in your secret manger: ${keyToClear}`);
        });

    });

    describe('AWS - Secrect Manger Client', () => {
        beforeEach(() => 
        {   
            const {secretUncapitalized,secertsLikeAWS} = randomSecret();
            ctx.secretUncapitalized = secretUncapitalized;
            ctx.secertsLikeAWS = secertsLikeAWS;  
            ctx.awsSdkSecretMangerSendStub = awsSdkSecretMangerSendStub(env.secretMangerClientAWS);      
            loadSecretToAwsMockSecretManger(ctx.awsSdkSecretMangerSendStub ,ctx.secertsLikeAWS);
        });

        afterEach(()=>{
            ctx.awsSdkSecretMangerSendStub.restore();

        });

        test('get secret with aws secret client', async () => {
            const result = await env.secretMangerClientAWS.getSecrets();
            expect(result).toStrictEqual(ctx.secretUncapitalized);
        });

        test('get secerts without all the required fields', async () => {
            const deletedKey = deleteRandomKeyFromAwsMockSecretManger(ctx.awsSdkSecretMangerSendStub ,ctx.secertsLikeAWS);
            await expect(env.secretMangerClientAWS.getSecrets()).rejects.toThrow(`Error occurred retrieving secerts: Error: Please set the next variable/s in your secret manger: ${deletedKey}`);
        });
        test('get secerts with a field that is empty', async () => {
            const keyToClear = clearRandomKeyFromAwsMockSecretManger(ctx.awsSdkSecretMangerSendStub ,ctx.secertsLikeAWS);
            await expect(env.secretMangerClientAWS.getSecrets()).rejects.toThrow(`Error occurred retrieving secerts: Error: Please set the next variable/s in your secret manger: ${keyToClear}`);
        });
    });

    describe('GCP - Secrect Manger Client', () => {
        
        beforeEach(() => {        
            const {secertsLikeGCPCapitalized, secertsLikeGCPUncapitalized} = randomSecret();
            ctx.secertsLikeGCPCapitalized = secertsLikeGCPCapitalized;
            ctx.secertsLikeGCPUncapitalized = secertsLikeGCPUncapitalized;   
            loadSecretsToEnv( ctx.secertsLikeGCPCapitalized );

        });

        test('get secret with GCP secret client', async () => {
            const result = await env.secretMangerClientGCP.getSecrets();
            expect(result).toStrictEqual(ctx.secertsLikeGCPUncapitalized);
        });

        test('get secerts without all the required fields', async () => {
            const { deletedKey } = deleteRandomSecretFromEnv(ctx.secertsLikeGCPCapitalized);
            await expect(env.secretMangerClientGCP.getSecrets()).rejects.toThrow(`Please set the next variable/s in your secret manger: ${deletedKey}`);
        });

        test('get secerts with a field that is empty', async () => {
            const keyToClear = clearRandomSecretFromEnv(ctx.secertsLikeGCPCapitalized);
            await expect(env.secretMangerClientGCP.getSecrets()).rejects.toThrow(`Please set the next variable/s in your secret manger: ${keyToClear}`);
        });

    });


    const ctx = { 
    }; 

    const env = {
    };

    beforeAll(() =>  {
        const { SecretMangerClient , SecretMangerClientAWS, SecretMangerClientGCP } = require('./secretMagerClients');
        env.secretMangerClient = new SecretMangerClient();
        env.secretMangerClientAWS = new SecretMangerClientAWS('DB_INFO','us-east-1');
        env.secretMangerClientGCP = new SecretMangerClientGCP();
    });

})

