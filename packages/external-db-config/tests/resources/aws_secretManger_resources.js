
const mockClient = require('aws-sdk-client-mock');
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
const { lowercaseKeys,deleteRandomSecret,clearRandomSecretKey } = require("./test_commons");

const createDriver = () => {
    const mockedAwsSdk = mockClient.mockClient(SecretsManagerClient);
    const driver = {
        stubSecret: (secret) => mockedAwsSdk.on(GetSecretValueCommand).resolves({ SecretString: JSON.stringify(secret) }),
        stubBrokenSecret: (secret) => {
            const { deletedKey, newSecret } = deleteRandomSecret(secret);
            mockedAwsSdk.on(GetSecretValueCommand).resolves({ SecretString: JSON.stringify(newSecret) })
            return { deletedKey, newSecret }
        },
        stubSecretWithEmptyField: (secret) => {
            const { clearedKey, newSecret } = clearRandomSecretKey(secret);
            mockedAwsSdk.on(GetSecretValueCommand).resolves({ SecretString: JSON.stringify(newSecret) });
            return { clearedKey, newSecret: secret };
        },
        restore: () => {
            mockedAwsSdk.reset();
        },

    };
    return driver;
}

const testHelper = () => {
    return {
        serviceFormat: (secret) => {
            secret.host = secret.HOST;
            secret.username = secret.USERNAME;
            secret.password = secret.PASSWORD;

            delete secret.HOST;
            delete secret.USERNAME;
            delete secret.PASSWORD;

            return secret;
        },
        secretClientFormat: (secret) => {
            const formatedSecret = lowercaseKeys(secret);
            formatedSecret.secretKey = formatedSecret.secret_key;
            delete formatedSecret.secret_key;
            return formatedSecret;
        }
    }
}

module.exports = { createDriver, testHelper }