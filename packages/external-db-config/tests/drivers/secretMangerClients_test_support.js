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
    deletedKey = randomKey(secrets);
    delete process.env[deletedKey];
    return deletedKey
};

const clearRandomSecretFromEnv = ( secrets ) => {
    keyToClear = randomKey(secrets);
    process.env[keyToClear] = '';
    return keyToClear;
}


const secretMangerTestHelper = {
    loadSecret: loadSecretsToEnv,
    deleteRandomSecertKey: deleteRandomSecretFromEnv,
    clearRandomSecretKey: clearRandomSecretFromEnv,
};

const secertMangerAWShelper = {
    awsSdkSecretMangerSendStub,
    loadSecret: loadSecretToAwsMockSecretManger,
    deleteRandomSecertKey: deleteRandomKeyFromAwsMockSecretManger,
    clearRandomSecretKey: clearRandomKeyFromAwsMockSecretManger,
}; 

module.exports = {secretMangerTestHelper,secertMangerAWShelper,randomSecret};
